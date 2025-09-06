from openai import OpenAI
from dotenv import load_dotenv
import os

# Load API key from .env
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Test AI request
response = client.chat.completions.create(
    model="gpt-4o-mini",  # Cheaper, faster
    messages=[
        {"role": "system", "content": "You are a helpful meal planning assistant."},
        {"role": "user", "content": "Generate a 1-day high-protein meal plan for a 25-year-old male, 2500 calories, breakfast, lunch, dinner, and snacks."}
    ]
)

print("\nGenerated Meal Plan:\n")
print(response.choices[0].message.content)
