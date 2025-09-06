from flask import Flask, request, jsonify
from openai import OpenAI
import mysql.connector
import json
import os
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Flask app
app = Flask(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---------------------------
# Get meals from database
# ---------------------------
def get_meals_from_db():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, name, description, calories, protein, carbs, fat, dietType, mealType, ingredients, suitableFor, tags, preparationTime
        FROM meals
    """)
    meals = cursor.fetchall()
    cursor.close()
    conn.close()
    return meals

# ---------------------------
# Get user preferences
# ---------------------------
def get_user_preferences(user_id):
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT age, gender, goal, dietType, culturalPreference, religiousRestrictions, dislikedFoods, mealsPerDay
        FROM profiles
        WHERE id = %s
    """, (user_id,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()

    if not result:
        return None

    allergies_list = [a.strip() for a in result["dislikedFoods"].split(",")] if result["dislikedFoods"] else []
    preferred_tags_list = []
    if result["culturalPreference"]:
        preferred_tags_list.append(result["culturalPreference"])
    if result["religiousRestrictions"]:
        preferred_tags_list.append(result["religiousRestrictions"])

    return {
        "age": result["age"],
        "gender": result["gender"],
        "goal": result["goal"],
        "diet_type": result["dietType"],
        "calorie_target": 2500,  # Default for now
        "allergies": allergies_list,
        "preferred_tags": preferred_tags_list
    }

# ---------------------------
# Generate meal plan
# ---------------------------
def generate_meal_plan(user_prefs, meals_db):
    prompt = f"""
You are a professional nutrition meal planner.
The user profile is: {user_prefs}.
Here is the available meals database: {meals_db}.
Create a 7-day meal plan with breakfast, lunch, dinner, and snack each day.
Ensure daily total calories are close to {user_prefs['calorie_target']} kcal.
Avoid meals with these allergies: {user_prefs['allergies']}.
Only use meals from the database provided.

Return ONLY valid JSON. No explanations, no notes, no code fences, nothing else.
The JSON format should look exactly like this:
[
  {{
    "day": 1,
    "breakfast": "Meal name here",
    "lunch": "Meal name here",
    "dinner": "Meal name here",
    "snack": "Meal name here"
  }}
]
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    raw_content = response.choices[0].message.content.strip()

    try:
        return json.loads(raw_content)
    except json.JSONDecodeError:
        json_match = re.search(r"\[.*\]", raw_content, re.S)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                return {"error": "JSON extraction failed", "raw": raw_content}
        return {"error": "No JSON found in AI response", "raw": raw_content}

# ---------------------------
# API endpoint
# ---------------------------
@app.route("/generate-meal-plan", methods=["POST"])
def api_generate_meal_plan():
    data = request.json
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    meals_db = get_meals_from_db()
    user_prefs = get_user_preferences(user_id)

    if not user_prefs:
        return jsonify({"error": f"No profile found for user_id {user_id}"}), 404

    meal_plan = generate_meal_plan(user_prefs, meals_db)
    return jsonify(meal_plan)

# ---------------------------
# Run the Flask API
# ---------------------------
if __name__ == "__main__":
    app.run(debug=True)
