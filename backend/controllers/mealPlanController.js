// controllers/mealPlanController.js
import { getMealsByPreferences } from "../models/mealPlanModel.js";
import db from "../config/db.js";

export const getMealPlan = async (req, res) => {
  try {
    // In real app: req.user.id comes from JWT authentication
    const userId = req.user?.id || 1; // Default to user 1 for testing

    // Get user's profile from `profiles` table
    const [profileRows] = await db.query(
      "SELECT dietType, dislikedFoods, mealsPerDay FROM profiles WHERE id = ? ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (!profileRows || profileRows.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const { dietType, dislikedFoods, mealsPerDay } = profileRows[0];
    const dislikedArray = dislikedFoods ? dislikedFoods.split(",").map(f => f.trim()) : [];

    // Get meals that match preferences
    const meals = await getMealsByPreferences(dietType, dislikedArray);

    // Build weekly meal plan
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const plan = days.map(day => ({
      day,
      meals: {
        breakfast: meals.find(m => m.mealType.toLowerCase() === "breakfast") || null,
        lunch: meals.find(m => m.mealType.toLowerCase() === "lunch") || null,
        dinner: meals.find(m => m.mealType.toLowerCase().includes("dinner")) || null,
        snacks: meals.find(m => m.mealType.toLowerCase() === "snack") || null,
      }
    }));

    res.json({
      dietType,
      dislikedFoods: dislikedArray,
      mealsPerDay,
      plan
    });

  } catch (error) {
    console.error("Error generating meal plan:", error);
    res.status(500).json({ error: "Error generating meal plan" });
  }
};
