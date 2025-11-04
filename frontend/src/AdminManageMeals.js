import React, { useState, useEffect } from 'react';

export default function AdminManageMeals() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    dietType: '',
    mealType: '',
    ingredients: '',
    suitableFor: '',
    tags: '',
    preparationTime: '',
    instructions: ''
  });

  // Fetch meals
  const fetchMeals = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/meals')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch meals');
        return res.json();
      })
      .then(data => {
        setMeals(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching meals:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Start editing a meal
  const handleEdit = (meal) => {
    setEditingMeal(meal.id);
    setFormData({
      name: meal.name || '',
      description: meal.description || '',
      calories: meal.calories || '',
      protein: meal.protein || '',
      carbs: meal.carbs || '',
      fat: meal.fat || '',
      dietType: meal.dietType || '',
      mealType: meal.mealType || '',
      ingredients: meal.ingredients || '',
      suitableFor: meal.suitableFor || '',
      tags: meal.tags || '',
      preparationTime: meal.preparationTime || '',
      instructions: meal.instructions || ''
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMeal(null);
  };

  // Update meal
  const handleUpdateMeal = (mealId) => {
    fetch(`http://localhost:5000/api/meals/${mealId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update meal');
      return res.json();
    })
    .then(data => {
      fetchMeals();
      setEditingMeal(null);
      alert('Meal updated successfully!');
    })
    .catch(err => {
      console.error('Error updating meal:', err);
      alert('Error updating meal');
    });
  };

  // Delete meal
  const handleDeleteMeal = (mealId) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) return;

    fetch(`http://localhost:5000/api/meals/${mealId}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to delete meal');
      return res.json();
    })
    .then(data => {
      fetchMeals();
      alert('Meal deleted successfully!');
    })
    .catch(err => {
      console.error('Error deleting meal:', err);
      alert('Error deleting meal');
    });
  };

  // Add new meal
  const handleAddMeal = () => {
    fetch('http://localhost:5000/api/meals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to add meal');
      return res.json();
    })
    .then(data => {
      fetchMeals();
      // Reset form
      setFormData({
        name: '',
        description: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        dietType: '',
        mealType: '',
        ingredients: '',
        suitableFor: '',
        tags: '',
        preparationTime: '',
        instructions: ''
      });
      alert('Meal added successfully!');
    })
    .catch(err => {
      console.error('Error adding meal:', err);
      alert('Error adding meal');
    });
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading meals...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>🍽️ Manage Meals</h2>
      
      {/* Add New Meal Form */}
      <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h3>➕ Add New Meal</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label>Meal Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Enter meal name"
            />
          </div>
          
          <div>
            <label>Calories:</label>
            <input
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Calories"
            />
          </div>

          <div>
            <label>Protein (g):</label>
            <input
              type="number"
              step="0.1"
              name="protein"
              value={formData.protein}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Protein"
            />
          </div>

          <div>
            <label>Carbs (g):</label>
            <input
              type="number"
              step="0.1"
              name="carbs"
              value={formData.carbs}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Carbs"
            />
          </div>

          <div>
            <label>Fat (g):</label>
            <input
              type="number"
              step="0.1"
              name="fat"
              value={formData.fat}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="Fat"
            />
          </div>

          <div>
            <label>Diet Type:</label>
            <select
              name="dietType"
              value={formData.dietType}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Select Diet Type</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
              <option value="paleo">Paleo</option>
              <option value="gluten-free">Gluten-Free</option>
              <option value="dairy-free">Dairy-Free</option>
              <option value="low-carb">Low-Carb</option>
              <option value="high-protein">High-Protein</option>
            </select>
          </div>

          <div>
            <label>Meal Type:</label>
            <select
              name="mealType"
              value={formData.mealType}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="">Select Meal Type</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
              <option value="dessert">Dessert</option>
            </select>
          </div>

          <div>
            <label>Preparation Time:</label>
            <input
              type="text"
              name="preparationTime"
              value={formData.preparationTime}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="e.g., 30 mins"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '60px' }}
              placeholder="Meal description"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Ingredients:</label>
            <textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '60px' }}
              placeholder="List ingredients (one per line or comma separated)"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Instructions:</label>
            <textarea
              name="instructions"
              value={formData.instructions}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '80px' }}
              placeholder="Cooking instructions"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Suitable For:</label>
            <input
              type="text"
              name="suitableFor"
              value={formData.suitableFor}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="e.g., Weight loss, Muscle gain, Diabetic"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label>Tags:</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              placeholder="e.g., quick, healthy, spicy (comma separated)"
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <button 
              onClick={handleAddMeal}
              style={{ 
                padding: '12px 30px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Add New Meal
            </button>
          </div>
        </div>
      </div>

      {/* Meals Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Calories</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Macros (P/C/F)</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Diet Type</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Meal Type</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Prep Time</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meals.map(meal => (
              <tr key={meal.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{meal.id}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd', fontWeight: 'bold' }}>
                  {editingMeal === meal.id ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '6px' }}
                    />
                  ) : (
                    meal.name
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {editingMeal === meal.id ? (
                    <input
                      type="number"
                      name="calories"
                      value={formData.calories}
                      onChange={handleInputChange}
                      style={{ width: '80px', padding: '6px' }}
                    />
                  ) : (
                    `${meal.calories} cal`
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd', fontSize: '12px' }}>
                  {editingMeal === meal.id ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input
                        type="number"
                        name="protein"
                        value={formData.protein}
                        onChange={handleInputChange}
                        style={{ width: '50px', padding: '4px' }}
                        placeholder="P"
                      />
                      <input
                        type="number"
                        name="carbs"
                        value={formData.carbs}
                        onChange={handleInputChange}
                        style={{ width: '50px', padding: '4px' }}
                        placeholder="C"
                      />
                      <input
                        type="number"
                        name="fat"
                        value={formData.fat}
                        onChange={handleInputChange}
                        style={{ width: '50px', padding: '4px' }}
                        placeholder="F"
                      />
                    </div>
                  ) : (
                    `P:${meal.protein}g C:${meal.carbs}g F:${meal.fat}g`
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {editingMeal === meal.id ? (
                    <select
                      name="dietType"
                      value={formData.dietType}
                      onChange={handleInputChange}
                      style={{ padding: '6px' }}
                    >
                      <option value="">Select Diet</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="keto">Keto</option>
                      <option value="paleo">Paleo</option>
                      <option value="gluten-free">Gluten-Free</option>
                    </select>
                  ) : (
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2'
                    }}>
                      {meal.dietType}
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {editingMeal === meal.id ? (
                    <select
                      name="mealType"
                      value={formData.mealType}
                      onChange={handleInputChange}
                      style={{ padding: '6px' }}
                    >
                      <option value="">Select Type</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  ) : (
                    meal.mealType
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {editingMeal === meal.id ? (
                    <input
                      type="text"
                      name="preparationTime"
                      value={formData.preparationTime}
                      onChange={handleInputChange}
                      style={{ width: '100px', padding: '6px' }}
                    />
                  ) : (
                    meal.preparationTime
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {editingMeal === meal.id ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        onClick={() => handleUpdateMeal(meal.id)}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: '#28a745', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '3px',
                          fontSize: '12px'
                        }}
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelEdit}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: '#6c757d', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '3px',
                          fontSize: '12px'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        onClick={() => handleEdit(meal)}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: '#ffc107', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '3px',
                          fontSize: '12px'
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteMeal(meal.id)}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: '#dc3545', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '3px',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meals.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          No meals found. Add some meals to get started!
        </div>
      )}
    </div>
  );
}