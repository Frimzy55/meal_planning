import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import OpenAI from "openai";

// Import your other routes
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import { authenticateToken, authorizeAdmin } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api", profileRoutes);

// ===== OPENAI CLIENT =====
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ---------------------------
// Get meals from database
// ---------------------------
async function getMealsFromDB() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const [rows] = await connection.execute(`
    SELECT id, name, description, calories, protein, carbs, fat, dietType, mealType, ingredients, suitableFor, tags, preparationTime
    FROM meals
  `);

  await connection.end();
  return rows;
}

// ---------------------------
// Get user preferences
// ---------------------------
async function getUserPreferences(user_id) {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const [rows] = await connection.execute(`
    SELECT age, gender, goal, dietType, culturalPreference, religiousRestrictions, dislikedFoods, mealsPerDay
    FROM profiles
    WHERE id = ?
  `, [user_id]);

  await connection.end();

  if (rows.length === 0) return null;

  const result = rows[0];
  const allergiesList = result.dislikedFoods
    ? result.dislikedFoods.split(",").map(a => a.trim())
    : [];
  const preferredTagsList = [];
  if (result.culturalPreference) preferredTagsList.push(result.culturalPreference);
  if (result.religiousRestrictions) preferredTagsList.push(result.religiousRestrictions);

  return {
    age: result.age,
    gender: result.gender,
    goal: result.goal,
    diet_type: result.dietType,
    calorie_target: 2500, // Default for now
    allergies: allergiesList,
    preferred_tags: preferredTagsList
  };
}

// ---------------------------
// Generate meal plan with OpenAI
// ---------------------------
async function generateMealPlan(userPrefs, mealsDB) {
  const prompt = `
You are a professional nutrition meal planner.
The user profile is: ${JSON.stringify(userPrefs)}.
Here is the available meals database: ${JSON.stringify(mealsDB)}.
Create a 7-day meal plan with breakfast, lunch, dinner, and snack each day.
Ensure daily total calories are close to ${userPrefs.calorie_target} kcal.
Avoid meals with these allergies: ${JSON.stringify(userPrefs.allergies)}.
Only use meals from the database provided.

Return ONLY valid JSON. No explanations, no notes, no code fences, nothing else.
The JSON format should look exactly like this:
[
  {
    "day": 1,
    "breakfast": "Meal name here",
    "lunch": "Meal name here",
    "dinner": "Meal name here",
    "snack": "Meal name here"
  }
]
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });

  let rawContent = completion.choices[0].message.content.trim();

  try {
    return JSON.parse(rawContent);
  } catch {
    const match = rawContent.match(/\[.*\]/s);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return { error: "JSON extraction failed", raw: rawContent };
      }
    }
    return { error: "No JSON found in AI response", raw: rawContent };
  }
}

// ---------------------------
// Meal Plan API endpoint
// ---------------------------
app.post("/generate-meal-plan", async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const mealsDB = await getMealsFromDB();
    const userPrefs = await getUserPreferences(user_id);

    if (!userPrefs) {
      return res.status(404).json({ error: `No profile found for user_id ${user_id}` });
    }

    const mealPlan = await generateMealPlan(userPrefs, mealsDB);

    // Transform AI output into the format your React expects
    const formattedPlan = mealPlan.map(day => ({
      day: day.day,
      meals: {
        breakfast: { name: day.breakfast, calories: 0 },
        lunch: { name: day.lunch, calories: 0 },
        dinner: { name: day.dinner, calories: 0 },
        snacks: { name: day.snack || day.snacks, calories: 0 }
      }
    }));

    res.json({
      plan: formattedPlan,
      dietType: userPrefs.diet_type
    });
  } catch (err) {
    console.error("Error generating meal plan:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ---------------------------
// Example protected route
// ---------------------------
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}! You accessed a protected route.` });
});

app.get("/api/admin/dashboard", authenticateToken, authorizeAdmin, (req, res) => {
  res.json({ message: `Hello Admin ${req.user.email}, welcome to the admin dashboard.` });
});

// ---------------------------
// Start server
// ---------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
