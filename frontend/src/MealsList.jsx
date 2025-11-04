import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MealsList() {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/meals')
      .then((res) => {
        setMeals(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch meals:', err);
      });
  }, []);

  return (
    <div className="p-4">
      <h4 className="text-success mb-3">🍽 Available Meals</h4>

      {meals.length === 0 ? (
        <p>No meals found.</p>
      ) : (
        <table className="table table-bordered">
          <thead className="table-success">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Calories</th>
              <th>Protein</th>
              <th>Carbs</th>
              <th>Fat</th>
              <th>Diet Type</th>
              <th>Meal Type</th>
            </tr>
          </thead>
          <tbody>
            {meals.map((meal) => (
              <tr key={meal.id}>
                <td>{meal.id}</td>
                <td>{meal.name}</td>
                <td>{meal.calories}</td>
                <td>{meal.protein}</td>
                <td>{meal.carbs}</td>
                <td>{meal.fat}</td>
                <td>{meal.dietType}</td>
                <td>{meal.mealType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
