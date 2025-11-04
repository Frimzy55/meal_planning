import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const NutrientTracker = ({ userId }) => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [dailyNutrients, setDailyNutrients] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [planId, setPlanId] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Get planId from localStorage or try to find user's latest plan
  useEffect(() => {
    const loadUserPlan = async () => {
      try {
        // First try to get from localStorage (saved when meal plan was created)
        const savedPlanId = localStorage.getItem('currentPlanId');
        if (savedPlanId) {
          console.log('📁 Found planId in localStorage:', savedPlanId);
          setPlanId(savedPlanId);
          return;
        }

        // If no saved plan, try to fetch user's latest plan
        if (userId) {
          console.log('🔍 Searching for user\'s latest meal plan...');
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `http://localhost:5000/api/user-latest-plan/${userId}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          if (response.data.planId) {
            console.log('✅ Found latest plan:', response.data.planId);
            setPlanId(response.data.planId);
            localStorage.setItem('currentPlanId', response.data.planId);
          }
        }
      } catch (error) {
        console.log('ℹ️ No existing meal plan found, user needs to create one first');
      }
    };

    loadUserPlan();
  }, [userId]);

  // Load nutrient data for a specific day from meal_plans table
  const loadDailyNutrients = useCallback(async (day) => {
    if (!planId) {
      console.log('❌ No planId available');
      setError('No meal plan found. Please create a meal plan first.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      console.log('🔍 Loading nutrients for plan:', planId, 'day:', day);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `http://localhost:5000/api/daily-nutrients/${planId}/${day}`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      console.log('✅ Nutrient data received:', response.data);
      setDailyNutrients(response.data);
    } catch (error) {
      console.error('❌ Error loading nutrients:', error);
      if (error.code === 'ECONNABORTED') {
        setError('Request timeout. Please check if the server is running.');
      } else if (error.response?.status === 404) {
        setError('Meal plan not found. Please create a new meal plan.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(`Failed to load nutrient data: ${error.response?.data?.error || error.message}`);
      }
      setDailyNutrients(null);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  // Load weekly summary (keeping this for future use but not calling it for now)
  // eslint-disable-next-line
  const loadWeeklySummary = useCallback(async () => {
    if (!planId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/weekly-nutrients/${planId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      console.log('✅ Weekly summary received:', response.data);
      // You can set this to state when you need to use weekly summary
      // setWeeklySummary(response.data);
    } catch (error) {
      console.error('❌ Error loading weekly summary:', error);
    }
  }, [planId]);

  useEffect(() => {
    console.log('🔄 useEffect triggered - planId:', planId, 'selectedDay:', selectedDay);
    if (planId && planId !== 'undefined') {
      loadDailyNutrients(selectedDay);
      // Temporarily comment out weekly summary until we need it
      // loadWeeklySummary();
    }
  }, [planId, selectedDay, loadDailyNutrients]); // removed loadWeeklySummary from dependencies

  // Track meal consumption (keeping this for future use)
  // eslint-disable-next-line
  const handleMealCompletion = async (mealType, consumedData) => {
    if (!planId) {
      alert('No meal plan selected');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/track-consumption',
        {
          userId,
          planId,
          day: selectedDay,
          mealType,
          consumed: consumedData
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // You can uncomment this when you implement consumption tracking
      // setConsumption(prev => ({
      //   ...prev,
      //   [mealType]: consumedData
      // }));

    } catch (error) {
      console.error('Error tracking meal:', error);
      alert('Failed to track meal completion');
    }
  };

  // Clear current plan and allow user to select a new one
  const handleClearPlan = () => {
    localStorage.removeItem('currentPlanId');
    setPlanId(null);
    setDailyNutrients(null);
    setError('');
  };

  console.log('📊 Current state - userId:', userId, 'planId:', planId, 'loading:', loading);

  // Show different states based on conditions
  if (!planId) {
    return (
      <div className="text-center py-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title text-warning">📋 No Active Meal Plan</h5>
            <p className="card-text">
              You don't have an active meal plan to track nutrients for.
            </p>
            <div className="mt-3">
              <Link to="/dashboard/planner" className="btn btn-primary me-2">
                🍽️ Create Meal Plan
              </Link>
              <button 
                className="btn btn-outline-secondary"
                onClick={() => {
                  const manualPlanId = prompt('Enter a plan ID if you have one:');
                  if (manualPlanId) {
                    setPlanId(manualPlanId);
                    localStorage.setItem('currentPlanId', manualPlanId);
                  }
                }}
              >
                🔢 Enter Plan ID
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="mt-2">Loading nutrient data for Plan #{planId}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="alert alert-danger">
          <h5>❌ Error Loading Data</h5>
          <p>{error}</p>
          <div className="mt-2">
            <button 
              className="btn btn-primary btn-sm me-2"
              onClick={() => loadDailyNutrients(selectedDay)}
            >
              Retry
            </button>
            <button 
              className="btn btn-outline-danger btn-sm"
              onClick={handleClearPlan}
            >
              Clear Plan
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dailyNutrients) {
    return (
      <div className="text-center py-4">
        <div className="alert alert-info">
          <h5>📊 No Nutrient Data Available</h5>
          <p>We couldn't find nutrient data for this meal plan.</p>
          <div className="small text-muted mt-2">
            Plan ID: {planId}<br />
            User ID: {userId}<br />
            Selected Day: {selectedDay}
          </div>
          <div className="mt-2">
            <button 
              className="btn btn-outline-primary btn-sm me-2"
              onClick={() => loadDailyNutrients(selectedDay)}
            >
              Try Again
            </button>
            <Link to="/dashboard/planner" className="btn btn-primary btn-sm">
              Create New Plan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nutrient-tracker">
      <div className="card">
        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0">📊 Nutrient Tracking</h4>
            <small className="text-muted">
  Plan #{planId} • {new Date(dailyNutrients.startDate).toLocaleDateString()} to {new Date(dailyNutrients.endDate).toLocaleDateString()}
</small>

          </div>
          <button 
            className="btn btn-sm btn-outline-light"
            onClick={handleClearPlan}
            title="Switch to different meal plan"
          >
            🔄 Change Plan
          </button>
        </div>
        <div className="card-body">
          
          {/* Day Selector */}
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label fw-bold">Select Day:</label>
              <select 
                className="form-select"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Current Selection:</label>
              <p className="mb-0 fw-semibold">{selectedDay}</p>
            </div>
          </div>

          {/* Daily Nutrient Summary */}
          <div className="row text-center mb-4">
            <div className="col-md-3 mb-3">
              <div className={`card ${dailyNutrients.totalCalories > dailyNutrients.targetCalories ? 'border-warning' : 'border-success'}`}>
                <div className="card-body">
                  <h6>🔥 Calories</h6>
                  <h4 className={dailyNutrients.totalCalories > dailyNutrients.targetCalories ? 'text-warning' : 'text-success'}>
                    {dailyNutrients.totalCalories}
                  </h4>
                  <small className="text-muted">Target: {dailyNutrients.targetCalories}</small>
                  <div className="progress mt-2" style={{height: '8px'}}>
                    <div 
                      className={`progress-bar ${dailyNutrients.totalCalories > dailyNutrients.targetCalories ? 'bg-warning' : 'bg-success'}`}
                      style={{width: `${Math.min(100, (dailyNutrients.totalCalories / dailyNutrients.targetCalories) * 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 mb-3">
              <div className="card border-info">
                <div className="card-body">
                  <h6>💪 Protein</h6>
                  <h4 className="text-info">{dailyNutrients.totalProtein}g</h4>
                  <small className="text-muted">Target: {dailyNutrients.targetProtein}g</small>
                  <div className="progress mt-2" style={{height: '8px'}}>
                    <div 
                      className="progress-bar bg-info"
                      style={{width: `${Math.min(100, (dailyNutrients.totalProtein / dailyNutrients.targetProtein) * 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 mb-3">
              <div className="card border-primary">
                <div className="card-body">
                  <h6>🌾 Carbs</h6>
                  <h4 className="text-primary">{dailyNutrients.totalCarbs}g</h4>
                  <small className="text-muted">Target: {dailyNutrients.targetCarbs}g</small>
                  <div className="progress mt-2" style={{height: '8px'}}>
                    <div 
                      className="progress-bar bg-primary"
                      style={{width: `${Math.min(100, (dailyNutrients.totalCarbs / dailyNutrients.targetCarbs) * 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3 mb-3">
              <div className="card border-secondary">
                <div className="card-body">
                  <h6>🥑 Fat</h6>
                  <h4 className="text-secondary">{dailyNutrients.totalFat}g</h4>
                  <small className="text-muted">Target: {dailyNutrients.targetFat}g</small>
                  <div className="progress mt-2" style={{height: '8px'}}>
                    <div 
                      className="progress-bar bg-secondary"
                      style={{width: `${Math.min(100, (dailyNutrients.totalFat / dailyNutrients.targetFat) * 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meal Breakdown */}
          <h5 className="mb-3">🍽️ Meal Breakdown - {selectedDay}</h5>
          <div className="row">
            {dailyNutrients.meals && dailyNutrients.meals.map((meal, index) => (
              <div key={index} className="col-md-4 mb-3">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="card-title">
                        {meal.type === 'breakfast' ? '🍳' : 
                         meal.type === 'lunch' ? '🥗' : '🍽️'} 
                        {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                      </h6>
                      {/* Consumption badge removed for now */}
                    </div>
                    
                    <p className="card-text">
                      <strong>{meal.name}</strong>
                    </p>
                    
                    <div className="nutrient-details small text-muted">
                      <div>🔥 {meal.calories} calories</div>
                      <div>💪 {meal.protein}g protein</div>
                      <div>🌾 {meal.carbs}g carbs</div>
                      <div>🥑 {meal.fat}g fat</div>
                    </div>

                    {/* Meal Completion Buttons - commented out for now */}
                    {/* <div className="mt-3">
                      <div className="btn-group w-100">
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleMealCompletion(meal.type, {
                            calories: meal.calories,
                            protein: meal.protein,
                            carbs: meal.carbs,
                            fat: meal.fat
                          })}
                        >
                          ✓ Mark as Eaten
                        </button>
                        <button 
                          className="btn btn-outline-warning btn-sm"
                          onClick={() => {
                            const customCalories = prompt('Enter actual calories consumed:', meal.calories);
                            if (customCalories) {
                              handleMealCompletion(meal.type, {
                                calories: parseInt(customCalories),
                                protein: meal.protein,
                                carbs: meal.carbs,
                                fat: meal.fat
                              });
                            }
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Progress - commented out for now */}
          {/* {weeklySummary && (
            <div className="mt-4">
              <h5>📈 Weekly Progress</h5>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Day</th>
                      <th>Calories</th>
                      <th>Protein</th>
                      <th>Carbs</th>
                      <th>Fat</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklySummary.dailyProgress && weeklySummary.dailyProgress.map((day, index) => (
                      <tr key={index} className={day.day === selectedDay ? 'table-active' : ''}>
                        <td>
                          <button 
                            className="btn btn-link p-0 text-decoration-none"
                            onClick={() => setSelectedDay(day.day)}
                          >
                            {day.day}
                          </button>
                        </td>
                        <td>
                          <span className={day.calories > day.targetCalories ? 'text-warning' : 'text-success'}>
                            {day.calories} / {day.targetCalories}
                          </span>
                        </td>
                        <td>{day.protein}g</td>
                        <td>{day.carbs}g</td>
                        <td>{day.fat}g</td>
                        <td>
                          {day.calories <= day.targetCalories ? (
                            <span className="badge bg-success">On Track</span>
                          ) : (
                            <span className="badge bg-warning">Over</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default NutrientTracker;