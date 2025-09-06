// models/mealPlanModel.js
import db from "../config/db.js";

export const getMealsByPreferences = async (dietType, dislikedFoods = []) => {
  let sql = `
    SELECT id, name, calories, protein, carbs, fat, dietType, mealType, ingredients
    FROM meals
    WHERE 1=1
  `;
  
  const params = [];

  // Filter by dietType if set
  if (dietType && dietType.trim() !== "") {
    sql += " AND dietType LIKE ?";
    params.push(`%${dietType}%`);
  }

  // Exclude disliked foods (like allergies)
  if (dislikedFoods.length > 0) {
    dislikedFoods.forEach(food => {
      sql += " AND ingredients NOT LIKE ?";
      params.push(`%${food}%`);
    });
  }

  sql += " ORDER BY RAND()"; // Random for variety

  const [rows] = await db.query(sql, params);
  return rows;
};
