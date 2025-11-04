import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MealPlanner({ userId }) {
  const [mealPlan, setMealPlan] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [savedPlanId, setSavedPlanId] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchMealPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/generate-meal-plan/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setMealPlan(res.data.plan);
        setUserName(res.data.user);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load meal plan");
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, [userId]);

  const handleSaveMealPlan = async () => {
    if (!mealPlan.length || !userId) return;

    setSaving(true);
    setSaveMessage("");

    try {
      const token = localStorage.getItem('token');
      
      // Calculate dates (current week)
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await axios.post(
        'http://localhost:5000/api/save-meal-plan',
        {
          userId: userId,
          mealPlan: {
            user: userName,
            plan: mealPlan,
            mealsPerDay: 3
          },
          startDate: startDate,
          endDate: endDate
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSaveMessage("✅ Meal plan saved successfully!");
      setSavedPlanId(response.data.planId);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage("");
      }, 3000);
      
    } catch (error) {
      console.error('Error saving meal plan:', error);
      setSaveMessage("❌ Failed to save meal plan. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateGroceryList = () => {
    if (savedPlanId) {
      window.location.href = `/grocery-list/${savedPlanId}`;
    } else {
      alert("Please save the meal plan first to generate a grocery list.");
    }
  };

  const handleViewFullPlan = () => {
    if (savedPlanId) {
      window.location.href = `/meal-plan/${savedPlanId}`;
    } else {
      alert("Please save the meal plan first to view the full plan.");
    }
  };

  if (loading) return <div className="text-center py-4">Loading meal plan...</div>;
  if (error) return <div className="text-center py-4 text-danger">{error}</div>;

  return (
    <div className="container py-4 meal-planner">
      {/* Header + Action Buttons */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <h2 className="text-success fw-bold m-0">
          🍽️ Weekly Meal Plan for {userName}
        </h2>
        <div className="d-flex gap-2 flex-wrap">
          <button 
            onClick={handleSaveMealPlan} 
            className="btn btn-primary"
            disabled={saving || !mealPlan.length}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Saving...
              </>
            ) : (
              "💾 Save Plan"
            )}
          </button>
          
          <button onClick={handlePrint} className="btn btn-outline-primary">
            🖨️ Print
          </button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`alert ${saveMessage.includes('✅') ? 'alert-success' : 'alert-danger'} mb-4`}>
          {saveMessage}
        </div>
      )}

      {/* Saved Plan Options */}
      {savedPlanId && (
        <div className="card mb-4 border-success">
          <div className="card-body">
            <h5 className="card-title text-success">🎉 Plan Saved Successfully!</h5>
            <p className="card-text">What would you like to do next?</p>
            <div className="d-flex gap-2 flex-wrap">
              <button 
                onClick={handleGenerateGroceryList}
                className="btn btn-outline-success"
              >
                🛒 Generate Grocery List
              </button>
              <button 
                onClick={handleViewFullPlan}
                className="btn btn-outline-primary"
              >
                📋 View Full Plan Details
              </button>
              <button 
                onClick={() => window.location.href = `/nutrition/${savedPlanId}`}
                className="btn btn-outline-info"
              >
                📊 Nutrition Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meal Plan Table */}
      <div className="card">
        <div className="card-header bg-success text-white">
          <h4 className="mb-0">📅 Weekly Schedule</h4>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-striped mb-0 print-table">
              <thead className="table-success">
                <tr>
                  <th className="py-3 px-4 text-start">Day</th>
                  <th className="py-3 px-4 text-start">Breakfast</th>
                  <th className="py-3 px-4 text-start">Lunch</th>
                  <th className="py-3 px-4 text-start">Dinner</th>
                </tr>
              </thead>
              <tbody>
                {mealPlan.map((dayPlan, index) => (
                  <tr key={index}>
                    <td className="fw-semibold text-primary">{dayPlan.day}</td>
                    <td><MealCell meal={dayPlan.breakfast} type="Breakfast" /></td>
                    <td><MealCell meal={dayPlan.lunch} type="Lunch" /></td>
                    <td><MealCell meal={dayPlan.dinner} type="Dinner" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print-only Styles */}
      <style jsx="true">{`
        @media print {
          body * {
            visibility: hidden;
          }
          .meal-planner, .meal-planner * {
            visibility: visible;
          }
          .meal-planner {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 20px;
          }
          .btn, .d-flex.gap-2, .card-header, .alert, .card.mb-4 {
            display: none !important;
          }
          h2 {
            text-align: center;
            margin-bottom: 20px;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }
          .print-table th, .print-table td {
            border: 1px solid #000;
            padding: 8px;
          }
          .print-table th {
            background: #e8f5e9;
          }
        }
      `}</style>
    </div>
  );
}

function MealCell({ meal, type }) {
  if (!meal) {
    return <span className="text-muted fst-italic">❌ No {type} available</span>;
  }
  return (
    <div>
      <span className="text-success fw-medium d-block">{meal.name}</span>
      {meal.calories && (
        <small className="text-muted">{meal.calories} cal</small>
      )}
    </div>
  );
}