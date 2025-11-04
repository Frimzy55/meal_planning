import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// ✅ Import images from src/assets
import localImg from '../assets/local.jpg';
import localImg1 from '../assets/local1.jpg';
import localImg2 from '../assets/local2.jpg';
import localImg3 from '../assets/local3.jpg';

export default function DefaultDashboard({ userId }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5000/api/dashboard-data/${userId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded shadow-sm p-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="mt-2">Loading your dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <h5>❌ Error</h5>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Section with Images */}
      <div className="bg-white rounded shadow-sm p-4 text-center mb-4">
        <h4 className="mt-0 mb-3 text-success">
          🍽️ Welcome to Your Personalized Meal Hub
        </h4>
        <p className="m-0 text-secondary mb-3">
          Track your nutrition and see a quick overview of your daily meal plan.
        </p>
        
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
          <img src={localImg} alt="Meal" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' }} />
          <img src={localImg1} alt="Nutrition" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' }} />
          <img src={localImg2} alt="Healthy" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' }} />
          <img src={localImg3} alt="Running" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' }} />
        </div>
      </div>

      {/* Main Dashboard Sections */}
      <div className="row">
        {/* Current Active Plan */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">📋 Current Meal Plan</h5>
            </div>
            <div className="card-body">
              {dashboardData?.currentPlan ? (
                <div>
                  <h6>Plan #{dashboardData.currentPlan.id}</h6>
                  <p className="mb-1">
                    <strong>Period:</strong> {dashboardData.currentPlan.startDate} to {dashboardData.currentPlan.endDate}
                  </p>
                  <p className="mb-1">
                    <strong>Status:</strong> 
                    <span className="badge bg-success ms-2">Active</span>
                  </p>
                  <div className="mt-3">
                    <Link to="/dashboard/tracker" className="btn btn-success btn-sm me-2">
                      Track Nutrients
                    </Link>
                    <Link to="/dashboard/grocery" className="btn btn-outline-success btn-sm">
                      View Grocery List
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted">No active meal plan</p>
                  <Link to="/dashboard/planner" className="btn btn-primary">
                    Create Your First Plan
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Nutrition Summary */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">📈 Today's Nutrition</h5>
            </div>
            <div className="card-body">
              {dashboardData?.todayNutrition ? (
                <div>
                  <div className="row text-center">
                    <div className="col-4">
                      <h6>🔥 Calories</h6>
                      <h5 className={dashboardData.todayNutrition.calories > dashboardData.todayNutrition.targetCalories ? 'text-warning' : 'text-success'}>
                        {dashboardData.todayNutrition.calories}
                      </h5>
                      <small className="text-muted">/{dashboardData.todayNutrition.targetCalories}</small>
                    </div>
                    <div className="col-4">
                      <h6>💪 Protein</h6>
                      <h5 className="text-info">{dashboardData.todayNutrition.protein}g</h5>
                      <small className="text-muted">/{dashboardData.todayNutrition.targetProtein}g</small>
                    </div>
                    <div className="col-4">
                      <h6>🎯 Progress</h6>
                      <h5 className="text-primary">
                        {Math.round((dashboardData.todayNutrition.calories / dashboardData.todayNutrition.targetCalories) * 100)}%
                      </h5>
                      <small className="text-muted">Daily Goal</small>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h6 className="text-success mb-3">Nutrition Summary</h6>
                    <div className="row">
                      <div className="col-4">
                        <div className="progress mb-2" style={{ height: '20px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            role="progressbar" 
                            style={{ width: `${Math.min(100, (dashboardData.todayNutrition.protein / dashboardData.todayNutrition.targetProtein) * 100)}%` }}
                          >
                            Protein
                          </div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="progress mb-2" style={{ height: '20px' }}>
                          <div 
                            className="progress-bar bg-success" 
                            role="progressbar" 
                            style={{ width: `${Math.min(100, (dashboardData.todayNutrition.carbs / dashboardData.todayNutrition.targetCarbs) * 100)}%` }}
                          >
                            Carbs
                          </div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="progress mb-2" style={{ height: '20px' }}>
                          <div 
                            className="progress-bar bg-warning" 
                            role="progressbar" 
                            style={{ width: `${Math.min(100, (dashboardData.todayNutrition.fat / dashboardData.todayNutrition.targetFat) * 100)}%` }}
                          >
                            Fats
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-muted fst-italic mt-2 small">
                      Progress bars show your intake vs. daily goals.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted">No nutrition data for today</p>
                  <Link to="/dashboard/tracker" className="btn btn-info">
                    Start Tracking
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">📅 Weekly Progress</h5>
            </div>
            <div className="card-body">
              {dashboardData?.weeklyProgress ? (
                <div>
                  <div className="mb-3">
                    <strong>Completion Rate:</strong>
                    <div className="progress mt-1" style={{ height: '15px' }}>
                      <div 
                        className="progress-bar bg-warning" 
                        style={{ width: `${dashboardData.weeklyProgress.completionRate}%` }}
                      >
                        {dashboardData.weeklyProgress.completionRate}%
                      </div>
                    </div>
                  </div>
                  <div className="row text-center">
                    <div className="col-4">
                      <h6>✅ Completed</h6>
                      <h5 className="text-success">{dashboardData.weeklyProgress.completedMeals}</h5>
                      <small className="text-muted">Meals</small>
                    </div>
                    <div className="col-4">
                      <h6>📊 Average</h6>
                      <h5 className="text-info">{dashboardData.weeklyProgress.averageCalories}</h5>
                      <small className="text-muted">Calories/day</small>
                    </div>
                    <div className="col-4">
                      <h6>🎯 Goals</h6>
                      <h5 className="text-primary">{dashboardData.weeklyProgress.goalsMet}</h5>
                      <small className="text-muted">Days on track</small>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-muted">No weekly progress data</p>
                  <small>Complete a few days of tracking to see your progress</small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Tips & Recommendations */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-secondary text-white">
              <h5 className="mb-0">💡 Tips & Recommendations</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6>🎯 Your Goals</h6>
                <p className="small mb-2">
                  Based on your profile: <strong>{dashboardData?.userGoal || 'Balanced Nutrition'}</strong>
                </p>
              </div>
              <div>
                <h6>📝 Quick Tips</h6>
                <ul className="small mb-0">
                  <li>Plan your meals for the week every Sunday</li>
                  <li>Track your nutrients daily for best results</li>
                  <li>Use the grocery list before shopping</li>
                  <li>Update your profile if your goals change</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Get Started Section */}
      {(!dashboardData || dashboardData.totalPlans === 0) && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-primary">
              <div className="card-body text-center">
                <h5 className="text-primary">🚀 Ready to Get Started?</h5>
                <p className="mb-3">
                  Create your first meal plan to unlock all features including nutrient tracking and grocery lists!
                </p>
                <Link to="/dashboard/planner" className="btn btn-primary btn-lg">
                  Create Your First Meal Plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
