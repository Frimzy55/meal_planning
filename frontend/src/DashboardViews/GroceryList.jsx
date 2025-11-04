import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const GroceryList = ({ userId }) => {
  const [groceryData, setGroceryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [planId, setPlanId] = useState(null);
  const [purchasedItems, setPurchasedItems] = useState({});

  // Get planId from localStorage or find user's latest plan
  useEffect(() => {
    const loadUserPlan = async () => {
      try {
        const savedPlanId = localStorage.getItem('currentPlanId');
        if (savedPlanId) {
          console.log('📁 Found planId in localStorage:', savedPlanId);
          setPlanId(savedPlanId);
          return;
        }

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
        console.log('ℹ️ No existing meal plan found');
      }
    };

    loadUserPlan();
  }, [userId]);

  // Load grocery list
  const loadGroceryList = useCallback(async () => {
    if (!planId) {
      setError('No meal plan found. Please create a meal plan first.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      console.log('🛒 Loading grocery list for plan:', planId);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:5000/api/grocery-list/${planId}`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000
        }
      );
      
      console.log('✅ Grocery list received:', response.data);
      setGroceryData(response.data);
      
      // Initialize purchased items state
      const initialPurchased = {};
      response.data.groceryList.forEach((item, index) => {
        initialPurchased[index] = false;
      });
      setPurchasedItems(initialPurchased);
      
    } catch (error) {
      console.error('❌ Error loading grocery list:', error);
      if (error.response?.status === 404) {
        setError('Meal plan not found. Please create a new meal plan.');
      } else {
        setError(`Failed to load grocery list: ${error.response?.data?.error || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    if (planId && planId !== 'undefined') {
      loadGroceryList();
    }
  }, [planId, loadGroceryList]);

  // Toggle item purchased status
  const togglePurchased = (index) => {
    setPurchasedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Clear current plan
  const handleClearPlan = () => {
    localStorage.removeItem('currentPlanId');
    setPlanId(null);
    setGroceryData(null);
    setError('');
  };

  // Export grocery list
  const handleExportList = () => {
    if (!groceryData) return;

    let content = `🛒 Grocery List\n`;
    content += `Plan ID: ${groceryData.planId}\n`;
    content += `Total Items: ${groceryData.totalItems}\n`;
    content += `Estimated Cost: $${groceryData.estimatedCost}\n\n`;

    Object.entries(groceryData.categories).forEach(([category, items]) => {
      content += `📦 ${category}\n`;
      items.forEach(item => {
        const status = purchasedItems[groceryData.groceryList.findIndex(i => i.name === item.name)] ? '✅ ' : '';
        content += `${status}${item.name} - ${item.quantity}\n`;
      });
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GroceryList_Plan${groceryData.planId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Print grocery list
  const handlePrint = () => {
    window.print();
  };

  console.log('📊 Current state - planId:', planId, 'loading:', loading);

  if (!planId) {
    return (
      <div className="text-center py-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title text-warning">📋 No Active Meal Plan</h5>
            <p className="card-text">
              You don't have an active meal plan to generate a grocery list.
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
        <div className="mt-2">Generating grocery list for Plan #{planId}...</div>
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
              onClick={loadGroceryList}
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

  if (!groceryData) {
    return (
      <div className="text-center py-4">
        <div className="alert alert-info">
          <h5>🛒 No Grocery List Available</h5>
          <p>We couldn't generate a grocery list for this meal plan.</p>
          <div className="mt-2">
            <button 
              className="btn btn-outline-primary btn-sm me-2"
              onClick={loadGroceryList}
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
    <div className="grocery-list">
      <div className="card">
        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0">🛒 Grocery List</h4>
            <small>Plan #{groceryData.planId} • {groceryData.totalItems} items • Est. ${groceryData.estimatedCost}</small>
          </div>
          <div>
            <button 
              className="btn btn-sm btn-outline-light me-2"
              onClick={handleExportList}
            >
              📥 Export
            </button>
            <button 
              className="btn btn-sm btn-outline-light me-2"
              onClick={handlePrint}
            >
              🖨️ Print
            </button>
            <button 
              className="btn btn-sm btn-outline-light"
              onClick={handleClearPlan}
              title="Switch to different meal plan"
            >
              🔄 Change Plan
            </button>
          </div>
        </div>
        <div className="card-body">
          
          {/* Summary Cards */}
          <div className="row text-center mb-4">
            <div className="col-md-3 mb-3">
              <div className="card border-success">
                <div className="card-body">
                  <h6>📦 Total Items</h6>
                  <h4 className="text-success">{groceryData.totalItems}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-info">
                <div className="card-body">
                  <h6>💰 Estimated Cost</h6>
                  <h4 className="text-info">${groceryData.estimatedCost}</h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-primary">
                <div className="card-body">
                  <h6>✅ Purchased</h6>
                  <h4 className="text-primary">
                    {Object.values(purchasedItems).filter(Boolean).length} / {groceryData.totalItems}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card border-warning">
                <div className="card-body">
                  <h6>📋 Categories</h6>
                  <h4 className="text-warning">{Object.keys(groceryData.categories).length}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* Grocery List by Categories */}
          {Object.entries(groceryData.categories).map(([category, items]) => (
            <div key={category} className="category-section mb-4">
              <h5 className="text-success mb-3">
                📦 {category} ({items.length} items)
              </h5>
              <div className="list-group">
                {items.map((item, index) => {
                  const globalIndex = groceryData.groceryList.findIndex(i => i.name === item.name);
                  const isPurchased = purchasedItems[globalIndex];
                  
                  return (
                    <div key={index} className="list-group-item">
                      <div className="form-check d-flex align-items-center">
                        <input
                          type="checkbox"
                          className="form-check-input me-3"
                          checked={isPurchased}
                          onChange={() => togglePurchased(globalIndex)}
                          style={{ transform: 'scale(1.2)' }}
                        />
                        <label className="form-check-label flex-grow-1">
                          <strong className={isPurchased ? 'text-decoration-line-through text-muted' : ''}>
                            {item.name}
                          </strong>
                          <span className="text-muted ms-2">- {item.quantity}</span>
                          {item.totalUses > 1 && (
                            <span className="badge bg-info ms-2">Used {item.totalUses}×</span>
                          )}
                        </label>
                        <span className="badge bg-secondary">{category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Shopping Tips */}
          <div className="mt-4 p-3 bg-light rounded">
            <h6>💡 Shopping Tips</h6>
            <ul className="mb-0 small">
              <li>Shop by category to save time in the store</li>
              <li>Check your pantry before buying to avoid duplicates</li>
              <li>Consider buying in bulk for frequently used items</li>
              <li>Look for seasonal produce to save money</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx="true">{`
        @media print {
          body * {
            visibility: hidden;
          }
          .grocery-list, .grocery-list * {
            visibility: visible;
          }
          .grocery-list {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 20px;
          }
          .btn, .card-header, .alert {
            display: none !important;
          }
          .category-section {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default GroceryList;