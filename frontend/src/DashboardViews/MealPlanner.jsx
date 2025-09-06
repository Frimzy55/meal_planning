// src/pages/MealPlanner.js
import React, { useEffect, useState } from "react";
import { Button, Card, Table } from "react-bootstrap";
import axios from "axios";

export default function MealPlanner() {
  const [mealPlanData, setMealPlanData] = useState(null); // store full backend response
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  axios
    .post("http://localhost:5000/generate-meal-plan", {
      user_id: 1 // or dynamic from logged-in user
    })
    .then((res) => {
      setMealPlanData(res.data); // No need to wrap in { plan: ... }
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching meal plan:", err);
      setLoading(false);
    });
}, []);



  const getDailyCalories = (meals) =>
    Object.values(meals).reduce((sum, meal) => sum + (meal?.calories || 0), 0);

  if (loading) return <p>Loading meal plan...</p>;
  if (!mealPlanData?.plan) return <p>No meal plan available</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📅 Meal Planner</h2>

      <Table bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>Day</th>
            <th>Breakfast</th>
            <th>Lunch</th>
            <th>Dinner</th>
            <th>Snacks</th>
            <th>Total Calories</th>
          </tr>
        </thead>
        <tbody>
          {mealPlanData.plan.map((dayPlan, index) => (
            <tr key={index}>
              <td><strong>{dayPlan.day}</strong></td>
              <td>
  {dayPlan.meals.breakfast?.name
    ? `${dayPlan.meals.breakfast.name} (${dayPlan.meals.breakfast.calories} kcal)`
    : "—"}
</td>
<td>
  {dayPlan.meals.lunch?.name
    ? `${dayPlan.meals.lunch.name} (${dayPlan.meals.lunch.calories} kcal)`
    : "—"}
</td>
<td>
  {dayPlan.meals.dinner?.name
    ? `${dayPlan.meals.dinner.name} (${dayPlan.meals.dinner.calories} kcal)`
    : "—"}
</td>
<td>
  {dayPlan.meals.snacks?.name
    ? `${dayPlan.meals.snacks.name} (${dayPlan.meals.snacks.calories} kcal)`
    : "—"}
</td>

              <td><strong>{getDailyCalories(dayPlan.meals)} kcal</strong></td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="d-flex gap-3 mt-4">
        <Button variant="primary">🛒 Generate Grocery List</Button>
        <Button variant="success">💾 Save Plan</Button>
        <Button variant="outline-secondary">⚙️ Customize Meals</Button>
      </div>

      <Card className="mt-4 p-3">
        <h5>📊 Nutritional Summary</h5>
        <p><strong>Diet Type:</strong> {mealPlanData.dietType || "Not specified"}</p>
        <p><strong>Daily Target:</strong> 2000 kcal</p>
        <p><strong>Macros:</strong> Protein 100g • Carbs 250g • Fat 60g</p>
      </Card>
    </div>
  );
}     