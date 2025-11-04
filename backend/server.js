import express from 'express';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL');
  }
});

// 📝 Signup
app.post('/api/auth/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (results.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertQuery = `
        INSERT INTO user (first_name, last_name, email, password, role)
        VALUES (?, ?, ?, ?, 'user')
      `;
      db.query(insertQuery, [firstName, lastName, email, hashedPassword], (insertErr) => {
        if (insertErr) return res.status(500).json({ error: 'Registration failed' });
        return res.json({ message: 'User registered successfully!' });
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});






// ✅ Save or Update Profile
app.post('/api/profile', (req, res) => {
  const {
    id, fullName, age, gender, height, weight,
    goal, activityLevel, medicalConditions,
    dietType, allergies, religiousRestrictions,
    dislikedFoods, mealsPerDay, mealTimes
  } = req.body;

  // Convert arrays to strings for DB storage
  const medicalConditionsStr = Array.isArray(medicalConditions) ? medicalConditions.join(',') : medicalConditions || '';
  const dislikedFoodsStr = Array.isArray(dislikedFoods) ? dislikedFoods.join(',') : dislikedFoods || '';

  const sql = `
    INSERT INTO profile
    (id, fullName, age, gender, height, weight, goal, activityLevel, medicalConditions, dietType, allergies, religiousRestrictions, dislikedFoods, mealsPerDay, breakfastTime, lunchTime, dinnerTime, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const values = [
    id, fullName, age, gender, height, weight,
    goal, activityLevel, medicalConditionsStr,
    dietType, allergies, religiousRestrictions,
    dislikedFoodsStr, mealsPerDay,
    mealTimes.breakfast, mealTimes.lunch, mealTimes.dinner
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error saving profile:", err);
      return res.status(500).json({ message: "Database error saving profile" });
    }
    res.json({ message: "Profile saved successfully!", profile_id: result.insertId });
  });
});

 
app.get('/api/profile/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM profile WHERE id = ? ORDER BY created_at DESC LIMIT 1`; // get latest profile for user
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("❌ Error fetching profile:", err);
      return res.status(500).json({ message: "Database error fetching profile" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const profile = results[0];
    // Convert back arrays
    profile.medicalConditions = profile.medicalConditions ? profile.medicalConditions.split(',') : [];
    profile.dislikedFoods = profile.dislikedFoods ? profile.dislikedFoods.split(',') : [];

    res.json(profile);
  });
});










// Update profile endpoint
app.put('/api/profile/:id', (req, res) => {
  const userId = req.params.id;
  const data = req.body;

  const sql = `
    UPDATE profile SET
      fullName = ?,
      age = ?,
      gender = ?,
      height = ?,
      weight = ?,
      goal = ?,
      activityLevel = ?,
      medicalConditions = ?,
      dietType = ?,
      allergies = ?,
      religiousRestrictions = ?,
      dislikedFoods = ?,
      mealsPerDay = ?,
      breakfastTime = ?,
      lunchTime = ?,
      dinnerTime = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      data.fullName,
      data.age,
      data.gender,
      data.height,
      data.weight,
      data.goal,
      data.activityLevel,
      Array.isArray(data.medicalConditions) ? data.medicalConditions.join(',') : data.medicalConditions,
      data.dietType,
      data.allergies,
      data.religiousRestrictions,
      Array.isArray(data.dislikedFoods) ? data.dislikedFoods.join(',') : data.dislikedFoods,
      data.mealsPerDay,
      data.breakfastTime,
      data.lunchTime,
      data.dinnerTime,
      userId
    ],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to update profile.' });
      }
      res.status(200).json({ message: 'Profile updated successfully!' });
    }
  );
});



app.get('/api/meals', (req, res) => {
  const sql = 'SELECT * FROM meals'; // assuming your table is named 'meals'
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to fetch meals' });
    }
    res.json(results);
  });
});


// 🟠 Login Route
// 🟠 Login Route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM user WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(400).json({ error: 'Invalid email or password' });

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // ✅ Convert snake_case to camelCase
    const userData = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role
    };

    return res.json({ token, user: userData });
  });
});

// 🧠 Middleware to verify token
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user; // { id, role, email }
    next();
  });
}

// 🧰 Middleware for admin-only access
function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access only' });
  }
  next();
}

// 🟡 Example: Protected route for users
app.get('/api/dashboard', verifyToken, (req, res) => {
  res.json({ message: `Welcome, user ID ${req.user.id}`, role: req.user.role });
});

// 🟠 Example: Admin-only route
app.get('/api/admin/dashboard', verifyToken, isAdmin, (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard 🚀' });
});




//import OpenAI from "openai";

//import OpenAI from "openai";
// Helper: get user profile
function normalizeText(text) {
  return text ? text.toLowerCase().trim() : "";
}

/**
 * 🔸 Generate a weekly meal plan based on user's profile
 * - Filters meals based on dietType, religiousRestrictions, dislikedFoods
 * - Distributes meals across breakfast, lunch, and dinner
 */
app.get("/generate-meal-plan/:userId", (req, res) => {
  const userId = req.params.userId;

  // 1️⃣ Get user's profile
  const profileQuery = `SELECT * FROM profile WHERE id = ? ORDER BY created_at DESC LIMIT 1`;
  db.query(profileQuery, [userId], (err, profileResults) => {
    if (err) {
      console.error("Profile fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch user profile" });
    }

    if (profileResults.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const profile = profileResults[0];
    
    // ✅ FIXED: Better array handling for disliked foods
    const dislikedFoods = profile.dislikedFoods
      ? profile.dislikedFoods.split(",")
          .map(food => food.trim().toLowerCase())
          .filter(food => food.length > 0) // Remove empty strings
      : [];

    console.log("Disliked foods:", dislikedFoods); // Debug log

    const religiousRestrictions = normalizeText(profile.religiousRestrictions);
    const dietType = normalizeText(profile.dietType);
    const mealsPerDay = parseInt(profile.mealsPerDay) || 3;

    // 2️⃣ Get all meals and filter according to profile
    const mealsQuery = `SELECT * FROM meals`;
    db.query(mealsQuery, (err, mealResults) => {
      if (err) {
        console.error("Meals fetch error:", err);
        return res.status(500).json({ error: "Failed to fetch meals" });
      }

      let filteredMeals = mealResults.filter((meal) => {
        const mealDiet = normalizeText(meal.dietType);
        const mealIngredients = normalizeText(meal.ingredients);
        const mealName = normalizeText(meal.name);

        // ✅ FIXED: Better disliked food checking
        if (dislikedFoods.length > 0) {
          const hasDislikedFood = dislikedFoods.some((dislikedFood) => {
            // Check both ingredients and meal name
            return mealIngredients.includes(dislikedFood) || 
                   mealName.includes(dislikedFood);
          });
          
          if (hasDislikedFood) {
            console.log(`Excluding meal: ${meal.name} - contains disliked food`);
            return false;
          }
        }

        // Match diet type if specified
        if (dietType && mealDiet && mealDiet !== dietType) {
          console.log(`Excluding meal: ${meal.name} - diet mismatch`);
          return false;
        }

        // Check religious restrictions
        if (religiousRestrictions) {
          if (religiousRestrictions === "no pork" && mealIngredients.includes("pork")) {
            console.log(`Excluding meal: ${meal.name} - contains pork`);
            return false;
          }
          if (religiousRestrictions === "halal" && !mealTags.includes("halal")) {
            console.log(`Excluding meal: ${meal.name} - not halal`);
            return false;
          }
          if (religiousRestrictions === "vegetarian" && !mealTags.includes("vegetarian")) {
            console.log(`Excluding meal: ${meal.name} - not vegetarian`);
            return false;
          }
        }

        return true;
      });

      console.log(`Filtered ${filteredMeals.length} meals from ${mealResults.length} total`);

      if (filteredMeals.length === 0) {
        return res.status(404).json({ error: "No suitable meals found" });
      }

      // 3️⃣ Group meals by mealType (Breakfast / Lunch / Dinner)
      const breakfastMeals = filteredMeals.filter(
        (m) => normalizeText(m.mealType).includes("breakfast")
      );
      const lunchMeals = filteredMeals.filter(
        (m) => normalizeText(m.mealType).includes("lunch")
      );
      const dinnerMeals = filteredMeals.filter(
        (m) => normalizeText(m.mealType).includes("dinner")
      );

      console.log(`Available: ${breakfastMeals.length} breakfast, ${lunchMeals.length} lunch, ${dinnerMeals.length} dinner`);

      // 4️⃣ Generate 7-day meal plan with better randomization
      const mealPlan = [];
      const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

      // Helper function to get random meal with fallback
      const getRandomMeal = (mealArray, fallbackArray, mealType) => {
        if (mealArray.length > 0) {
          return mealArray[Math.floor(Math.random() * mealArray.length)];
        }
        // If no specific meal type available, use any meal as fallback
        if (fallbackArray.length > 0) {
          console.log(`No ${mealType} meals available, using fallback`);
          return fallbackArray[Math.floor(Math.random() * fallbackArray.length)];
        }
        return null;
      };

      for (let day of daysOfWeek) {
        const dayPlan = {
          day,
          breakfast: getRandomMeal(breakfastMeals, filteredMeals, "breakfast"),
          lunch: getRandomMeal(lunchMeals, filteredMeals, "lunch"),
          dinner: getRandomMeal(dinnerMeals, filteredMeals, "dinner"),
        };
        mealPlan.push(dayPlan);
      }

      // 5️⃣ Return final weekly plan
      res.json({
        user: profile.fullName,
        mealsPerDay,
        dislikedFoods, // Include for debugging
        plan: mealPlan,
      });
    });
  });
});







// Save meal plan to database
app.post('/api/save-meal-plan', verifyToken, (req, res) => {
  const { userId, mealPlan, startDate, endDate } = req.body;

  // Validate required fields
  if (!userId || !mealPlan) {
    return res.status(400).json({ error: 'User ID and meal plan are required' });
  }

  const sql = `
    INSERT INTO meal_plans (user_id, plan_data, start_date, end_date, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  const planData = JSON.stringify(mealPlan);

  db.query(sql, [userId, planData, startDate, endDate], (err, result) => {
    if (err) {
      console.error("Error saving meal plan:", err);
      return res.status(500).json({ error: "Failed to save meal plan" });
    }
    res.json({ 
      message: "Meal plan saved successfully!", 
      planId: result.insertId 
    });
  });
});








// Add these APIs to your existing server.js file

// 1. Get daily nutrients from meal_plans table
// Add these APIs to your server.js

// 1. Get user's latest meal plan
// 1. Get user's latest meal plan
app.get('/api/user-latest-plan/:userId', verifyToken, (req, res) => {
  const userId = req.params.userId;
  console.log('🔍 Fetching latest meal plan for user:', userId);

  const sql = `SELECT id, plan_data, start_date, end_date FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching user's latest plan:", err);
      return res.status(500).json({ error: "Failed to fetch meal plan" });
    }

    if (results.length === 0) {
      console.log('ℹ️ No meal plans found for user:', userId);
      return res.status(404).json({ error: "No meal plans found. Please create a meal plan first." });
    }

    const mealPlan = results[0];
    console.log('✅ Found latest plan for user:', mealPlan.id);
    
    res.json({
      planId: mealPlan.id,
      startDate: mealPlan.start_date,
      endDate: mealPlan.end_date,
      message: "Latest meal plan found"
    });
  });
});

// 2. Get daily nutrients from meal_plans table (FIXED VERSION)
app.get('/api/daily-nutrients/:planId/:day', verifyToken, (req, res) => {
  const { planId, day } = req.params;
  console.log('🔍 Fetching daily nutrients for plan:', planId, 'day:', day);

  const sql = `SELECT plan_data, start_date, end_date FROM meal_plans WHERE id = ?`;
  db.query(sql, [planId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching meal plan:", err);
      return res.status(500).json({ error: "Failed to fetch meal plan" });
    }

    if (results.length === 0) {
      console.log('❌ Meal plan not found for ID:', planId);
      return res.status(404).json({ error: "Meal plan not found" });
    }

    const mealPlan = results[0];
    console.log('✅ Found meal plan:', mealPlan.id);
    console.log('📋 Plan data type:', typeof mealPlan.plan_data);
    console.log('📋 Plan data sample:', String(mealPlan.plan_data).substring(0, 100));
    
    try {
      // FIX: Check if plan_data is already an object or needs parsing
      let planData;
      if (typeof mealPlan.plan_data === 'object' && mealPlan.plan_data !== null) {
        // It's already an object (MySQL JSON field returns as object)
        planData = mealPlan.plan_data;
        console.log('✅ Plan data is already an object');
      } else if (typeof mealPlan.plan_data === 'string') {
        // It's a string, needs parsing
        planData = JSON.parse(mealPlan.plan_data);
        console.log('✅ Plan data parsed from string');
      } else {
        throw new Error(`Unexpected plan_data type: ${typeof mealPlan.plan_data}`);
      }
      
      console.log('✅ Plan data processed successfully');
      
      // Check if plan structure is correct
      if (!planData.plan || !Array.isArray(planData.plan)) {
        console.log('❌ Invalid plan structure - missing plan array');
        console.log('📋 Available keys:', Object.keys(planData));
        return res.status(500).json({ error: "Invalid meal plan structure" });
      }
      
      // Find the specific day in the plan (case-insensitive)
      const dayPlan = planData.plan.find(d => d.day && d.day.toLowerCase() === day.toLowerCase());
      if (!dayPlan) {
        console.log('❌ Day not found in plan:', day);
        console.log('Available days:', planData.plan.map(d => d.day));
        return res.status(404).json({ error: `Day "${day}" not found in plan` });
      }

      console.log('✅ Found day plan:', dayPlan.day);
      
      // Calculate nutrients for the day
      const dailyNutrients = calculateDailyNutrients(dayPlan);
      console.log('📊 Calculated nutrients:', dailyNutrients);
      
      res.json({
        ...dailyNutrients,
        startDate: mealPlan.start_date,
        endDate: mealPlan.end_date,
        planId: parseInt(planId)
      });
    } catch (parseError) {
      console.error('❌ Error processing plan_data:', parseError);
      console.error('❌ Plan data that failed:', mealPlan.plan_data);
      return res.status(500).json({ error: "Invalid meal plan data format: " + parseError.message });
    }
  });
});

// 3. Get weekly nutrients summary (FIXED VERSION)
app.get('/api/weekly-nutrients/:planId', verifyToken, (req, res) => {
  const planId = req.params.planId;
  console.log('📅 Fetching weekly nutrients for plan:', planId);

  const sql = `SELECT plan_data FROM meal_plans WHERE id = ?`;
  db.query(sql, [planId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching meal plan:", err);
      return res.status(500).json({ error: "Failed to fetch meal plan" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Meal plan not found" });
    }

    try {
      const mealPlan = results[0];
      let planData;
      
      // FIX: Handle both object and string plan_data
      if (typeof mealPlan.plan_data === 'object' && mealPlan.plan_data !== null) {
        planData = mealPlan.plan_data;
      } else if (typeof mealPlan.plan_data === 'string') {
        planData = JSON.parse(mealPlan.plan_data);
      } else {
        throw new Error(`Unexpected plan_data type: ${typeof mealPlan.plan_data}`);
      }

      if (!planData.plan || !Array.isArray(planData.plan)) {
        return res.status(500).json({ error: "Invalid meal plan structure" });
      }
      
      const weeklySummary = calculateWeeklySummary(planData.plan);
      console.log('✅ Weekly summary calculated');
      
      res.json(weeklySummary);
    } catch (parseError) {
      console.error('❌ Error processing plan_data:', parseError);
      return res.status(500).json({ error: "Invalid meal plan data format" });
    }
  });
});

// 4. Track consumption (your existing code)
app.post('/api/track-consumption', verifyToken, (req, res) => {
  const { userId, planId, day, mealType, consumed } = req.body;
  console.log('📝 Tracking consumption:', { userId, planId, day, mealType, consumed });

  res.json({ 
    message: "Consumption tracked successfully!",
    tracked: {
      userId,
      planId,
      day,
      mealType,
      consumed
    }
  });
});

// 5. Debug endpoint to check meal_plans data (FIXED VERSION)
app.get('/api/debug/meal-plans/:planId', verifyToken, (req, res) => {
  const planId = req.params.planId;
  console.log('🐛 Debug endpoint called for plan:', planId);
  
  const sql = `SELECT id, user_id, start_date, end_date, plan_data, created_at FROM meal_plans WHERE id = ?`;
  db.query(sql, [planId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Meal plan not found" });
    }

    const mealPlan = results[0];
    let planData;
    let parseError = null;
    let dataType = typeof mealPlan.plan_data;
    
    try {
      if (dataType === 'object' && mealPlan.plan_data !== null) {
        planData = mealPlan.plan_data;
      } else if (dataType === 'string') {
        planData = JSON.parse(mealPlan.plan_data);
      } else {
        planData = { error: `Unexpected data type: ${dataType}` };
      }
    } catch (e) {
      planData = { error: "Failed to parse JSON" };
      parseError = e.message;
    }

    res.json({
      planId: mealPlan.id,
      userId: mealPlan.user_id,
      startDate: mealPlan.start_date,
      endDate: mealPlan.end_date,
      createdAt: mealPlan.created_at,
      planDataType: dataType,
      planData: planData,
      parseError: parseError,
      rawDataSample: String(mealPlan.plan_data).substring(0, 200)
    });
  });
});

// Helper function to calculate daily nutrients (improved version)
function calculateDailyNutrients(dayPlan) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  const meals = [];

  console.log('🍽️ Processing day plan:', dayPlan.day);

  ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
    const meal = dayPlan[mealType];
    console.log(`   ${mealType}:`, meal);
    
    if (meal && meal.name) {
      // Extract nutrient values - handle different possible field names
      const mealCalories = parseInt(meal.calories || meal.calorie || 0);
      const mealProtein = parseInt(meal.protein || 0);
      const mealCarbs = parseInt(meal.carbs || meal.carbohydrates || 0);
      const mealFat = parseInt(meal.fat || 0);

      console.log(`   ${mealType} nutrients:`, { 
        calories: mealCalories, 
        protein: mealProtein, 
        carbs: mealCarbs, 
        fat: mealFat 
      });

      totalCalories += mealCalories;
      totalProtein += mealProtein;
      totalCarbs += mealCarbs;
      totalFat += mealFat;

      meals.push({
        type: mealType,
        name: meal.name,
        calories: mealCalories,
        protein: mealProtein,
        carbs: mealCarbs,
        fat: mealFat
      });
    } else {
      console.log(`   ${mealType}: No meal data or missing name`);
    }
  });

  const result = {
    day: dayPlan.day,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    meals,
    targetCalories: 2000,
    targetProtein: 150,
    targetCarbs: 250,
    targetFat: 70
  };

  console.log('📊 Final daily nutrients:', result);
  return result;
}

// Helper function to calculate weekly summary
function calculateWeeklySummary(weeklyPlan) {
  const dailyProgress = weeklyPlan.map(dayPlan => {
    const dayNutrients = calculateDailyNutrients(dayPlan);
    return {
      day: dayPlan.day,
      calories: dayNutrients.totalCalories,
      protein: dayNutrients.totalProtein,
      carbs: dayNutrients.totalCarbs,
      fat: dayNutrients.totalFat,
      targetCalories: dayNutrients.targetCalories,
      targetProtein: dayNutrients.targetProtein,
      targetCarbs: dayNutrients.targetCarbs,
      targetFat: dayNutrients.targetFat
    };
  });

  const weeklyTotals = dailyProgress.reduce((acc, day) => ({
    calories: acc.calories + day.calories,
    protein: acc.protein + day.protein,
    carbs: acc.carbs + day.carbs,
    fat: acc.fat + day.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return {
    dailyProgress,
    weeklyTotals,
    dailyAverages: {
      calories: Math.round(weeklyTotals.calories / 7),
      protein: Math.round(weeklyTotals.protein / 7),
      carbs: Math.round(weeklyTotals.carbs / 7),
      fat: Math.round(weeklyTotals.fat / 7)
    }
  };
}
















// Grocery List APIs

// 1. Generate grocery list from meal plan
app.get('/api/grocery-list/:planId', verifyToken, (req, res) => {
  const planId = req.params.planId;
  console.log('🛒 Generating grocery list for plan:', planId);

  const sql = `SELECT plan_data FROM meal_plans WHERE id = ?`;
  db.query(sql, [planId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching meal plan:", err);
      return res.status(500).json({ error: "Failed to fetch meal plan" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Meal plan not found" });
    }

    try {
      const mealPlan = results[0];
      let planData;
      
      // Handle both object and string plan_data
      if (typeof mealPlan.plan_data === 'object' && mealPlan.plan_data !== null) {
        planData = mealPlan.plan_data;
      } else if (typeof mealPlan.plan_data === 'string') {
        planData = JSON.parse(mealPlan.plan_data);
      } else {
        throw new Error(`Unexpected plan_data type: ${typeof mealPlan.plan_data}`);
      }

      if (!planData.plan || !Array.isArray(planData.plan)) {
        return res.status(500).json({ error: "Invalid meal plan structure" });
      }
      
      const groceryList = generateGroceryList(planData.plan);
      console.log('✅ Grocery list generated with', groceryList.length, 'items');
      
      res.json({
        planId: parseInt(planId),
        groceryList: groceryList,
        totalItems: groceryList.length,
        estimatedCost: calculateEstimatedCost(groceryList),
        categories: getGroceryCategories(groceryList)
      });
    } catch (error) {
      console.error('❌ Error generating grocery list:', error);
      return res.status(500).json({ error: "Failed to generate grocery list" });
    }
  });
});

// 2. Save grocery list (optional - for future use)
app.post('/api/save-grocery-list', verifyToken, (req, res) => {
  const { userId, planId, groceryList, listName } = req.body;
  
  const sql = `
    INSERT INTO grocery_lists (user_id, plan_id, list_name, list_data, created_at)
    VALUES (?, ?, ?, ?, NOW())
  `;

  const listData = JSON.stringify(groceryList);

  db.query(sql, [userId, planId, listName, listData], (err, result) => {
    if (err) {
      console.error("❌ Error saving grocery list:", err);
      return res.status(500).json({ error: "Failed to save grocery list" });
    }
    
    res.json({ 
      message: "Grocery list saved successfully!", 
      listId: result.insertId 
    });
  });
});

// 3. Get user's saved grocery lists
app.get('/api/grocery-lists/:userId', verifyToken, (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT gl.*, mp.start_date, mp.end_date 
    FROM grocery_lists gl 
    LEFT JOIN meal_plans mp ON gl.plan_id = mp.id 
    WHERE gl.user_id = ? 
    ORDER BY gl.created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching grocery lists:", err);
      return res.status(500).json({ error: "Failed to fetch grocery lists" });
    }

    // Parse JSON data
    const groceryLists = results.map(list => ({
      ...list,
      list_data: JSON.parse(list.list_data)
    }));

    res.json(groceryLists);
  });
});

// Helper function to generate grocery list from weekly plan
function generateGroceryList(weeklyPlan) {
  const ingredientsMap = new Map();

  weeklyPlan.forEach(day => {
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      const meal = day[mealType];
      if (meal && meal.ingredients) {
        // Handle both string and array formats for ingredients
        let ingredients = [];
        
        if (Array.isArray(meal.ingredients)) {
          ingredients = meal.ingredients;
        } else if (typeof meal.ingredients === 'string') {
          ingredients = meal.ingredients.split(',').map(ing => ing.trim());
        }
        
        ingredients.forEach(ingredient => {
          if (ingredient && ingredient !== 'N/A' && ingredient !== '') {
            // Parse ingredient format: "name: quantity" or just "name"
            const [name, quantity] = ingredient.split(':').map(item => item.trim());
            const cleanName = name.toLowerCase();
            
            if (ingredientsMap.has(cleanName)) {
              const existing = ingredientsMap.get(cleanName);
              ingredientsMap.set(cleanName, {
                ...existing,
                quantity: existing.quantity + ' + ' + (quantity || '1 portion'),
                totalUses: existing.totalUses + 1
              });
            } else {
              ingredientsMap.set(cleanName, {
                name: name,
                quantity: quantity || '1 portion',
                category: categorizeIngredient(name),
                purchased: false,
                totalUses: 1
              });
            }
          }
        });
      }
    });
  });

  return Array.from(ingredientsMap.values()).sort((a, b) => 
    a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );
}

// Helper function to categorize ingredients
function categorizeIngredient(ingredientName) {
  const name = ingredientName.toLowerCase();
  
  if (name.includes('chicken') || name.includes('beef') || name.includes('pork') || 
      name.includes('fish') || name.includes('salmon') || name.includes('turkey') ||
      name.includes('meat') || name.includes('egg')) {
    return 'Proteins';
  } else if (name.includes('broccoli') || name.includes('spinach') || name.includes('carrot') ||
             name.includes('tomato') || name.includes('onion') || name.includes('garlic') ||
             name.includes('vegetable') || name.includes('lettuce') || name.includes('pepper')) {
    return 'Vegetables';
  } else if (name.includes('apple') || name.includes('banana') || name.includes('orange') ||
             name.includes('berry') || name.includes('fruit')) {
    return 'Fruits';
  } else if (name.includes('rice') || name.includes('pasta') || name.includes('bread') ||
             name.includes('oat') || name.includes('flour') || name.includes('grain') ||
             name.includes('cereal')) {
    return 'Grains & Carbs';
  } else if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') ||
             name.includes('butter') || name.includes('cream')) {
    return 'Dairy';
  } else if (name.includes('oil') || name.includes('vinegar') || name.includes('sauce') ||
             name.includes('spice') || name.includes('herb') || name.includes('salt') ||
             name.includes('pepper') || name.includes('sugar')) {
    return 'Pantry Items';
  } else {
    return 'Other';
  }
}

// Helper function to calculate estimated cost
function calculateEstimatedCost(groceryList) {
  const categoryPrices = {
    'Proteins': 8,
    'Vegetables': 3,
    'Fruits': 4,
    'Grains & Carbs': 2,
    'Dairy': 5,
    'Pantry Items': 6,
    'Other': 4
  };

  const total = groceryList.reduce((sum, item) => {
    return sum + (categoryPrices[item.category] || 5);
  }, 0);

  return total;
}

// Helper function to get grocery categories
function getGroceryCategories(groceryList) {
  const categories = {};
  
  groceryList.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });
  
  return categories;
}



















// Dashboard data API
app.get('/api/dashboard-data/:userId', verifyToken, (req, res) => {
  const userId = req.params.userId;
  console.log('📊 Loading dashboard data for user:', userId);

  // Get user's profile for goals
  const profileSql = `SELECT goal FROM profile WHERE id = ? ORDER BY created_at DESC LIMIT 1`;
  
  // Get meal plans count
  const plansSql = `SELECT COUNT(*) as totalPlans FROM meal_plans WHERE user_id = ?`;
  
  // Get latest meal plan
  const latestPlanSql = `SELECT id, start_date, end_date FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`;
  
  // Get grocery lists count
  const grocerySql = `SELECT COUNT(*) as groceryLists FROM grocery_lists WHERE user_id = ?`;

  db.query(profileSql, [userId], (err, profileResults) => {
    if (err) {
      console.error("Error fetching profile:", err);
      return res.status(500).json({ error: "Failed to fetch dashboard data" });
    }

    const userGoal = profileResults.length > 0 ? profileResults[0].goal : 'Balanced Nutrition';

    // Get meal plans count
    db.query(plansSql, [userId], (err, plansResults) => {
      if (err) {
        console.error("Error fetching plans count:", err);
        return res.status(500).json({ error: "Failed to fetch dashboard data" });
      }

      const totalPlans = plansResults[0].totalPlans;

      // Get latest meal plan
      db.query(latestPlanSql, [userId], (err, latestPlanResults) => {
        if (err) {
          console.error("Error fetching latest plan:", err);
          return res.status(500).json({ error: "Failed to fetch dashboard data" });
        }

        const currentPlan = latestPlanResults.length > 0 ? {
          id: latestPlanResults[0].id,
          startDate: latestPlanResults[0].start_date,
          endDate: latestPlanResults[0].end_date
        } : null;

        // Get grocery lists count
        db.query(grocerySql, [userId], (err, groceryResults) => {
          if (err) {
            console.error("Error fetching grocery lists:", err);
            return res.status(500).json({ error: "Failed to fetch dashboard data" });
          }

          const groceryLists = groceryResults[0].groceryLists;

          // Mock data for demonstration (replace with actual tracking data)
          const dashboardData = {
            totalPlans,
            groceryLists,
            userGoal,
            currentPlan,
            trackedDays: Math.min(totalPlans * 3, 15),
            goalsMet: 75,
            todayNutrition: currentPlan ? {
              calories: 1850,
              targetCalories: 2000,
              protein: 120,
              targetProtein: 150,
              carbs: 200,
              targetCarbs: 250,
              fat: 65,
              targetFat: 70
            } : null,
            weeklyProgress: currentPlan ? {
              completionRate: 60,
              completedMeals: 12,
              averageCalories: 1950,
              goalsMet: 4
            } : null
          };

          console.log('✅ Dashboard data loaded:', dashboardData);
          res.json(dashboardData);
        });
      });
    });
  });
});





app.get('/api/mealss', (req, res) => {
  const sql = 'SELECT * FROM meals ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Failed to fetch meals:', err);
      return res.status(500).json({ error: 'Failed to fetch meals' });
    }
    res.json(results);
  });
});












// GET all users
app.get('/api/users', (req, res) => {
  const sql = 'SELECT id, first_name, last_name, email, role, created_at FROM user ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Failed to fetch users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(results);
  });
});

// UPDATE user
app.put('/api/users/:id', (req, res) => {
  const { first_name, last_name, email, role } = req.body;
  const userId = req.params.id;
  
  const sql = 'UPDATE user SET first_name = ?, last_name = ?, email = ?, role = ? WHERE id = ?';
  db.query(sql, [first_name, last_name, email, role, userId], (err, results) => {
    if (err) {
      console.error('❌ Failed to update user:', err);
      return res.status(500).json({ error: 'Failed to update user' });
    }
    res.json({ message: 'User updated successfully' });
  });
});

// DELETE user
app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  
  const sql = 'DELETE FROM user WHERE id = ?';
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('❌ Failed to delete user:', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});









// GET all meals
app.get('/api/meals', (req, res) => {
  const sql = 'SELECT * FROM meals ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Failed to fetch meals:', err);
      return res.status(500).json({ error: 'Failed to fetch meals' });
    }
    res.json(results);
  });
});

// POST new meal
app.post('/api/meals', (req, res) => {
  const { name, description, calories, protein, carbs, fat, dietType, mealType, ingredients, suitableFor, tags, preparationTime, instructions } = req.body;
  
  const sql = `INSERT INTO meals (name, description, calories, protein, carbs, fat, dietType, mealType, ingredients, suitableFor, tags, preparationTime, instructions) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.query(sql, [name, description, calories, protein, carbs, fat, dietType, mealType, ingredients, suitableFor, tags, preparationTime, instructions], (err, results) => {
    if (err) {
      console.error('❌ Failed to add meal:', err);
      return res.status(500).json({ error: 'Failed to add meal' });
    }
    res.json({ message: 'Meal added successfully', id: results.insertId });
  });
});

// UPDATE meal
app.put('/api/meals/:id', (req, res) => {
  const { name, description, calories, protein, carbs, fat, dietType, mealType, ingredients, suitableFor, tags, preparationTime, instructions } = req.body;
  const mealId = req.params.id;
  
  const sql = `UPDATE meals SET 
    name = ?, description = ?, calories = ?, protein = ?, carbs = ?, fat = ?, 
    dietType = ?, mealType = ?, ingredients = ?, suitableFor = ?, tags = ?, 
    preparationTime = ?, instructions = ? 
    WHERE id = ?`;
  
  db.query(sql, [name, description, calories, protein, carbs, fat, dietType, mealType, ingredients, suitableFor, tags, preparationTime, instructions, mealId], (err, results) => {
    if (err) {
      console.error('❌ Failed to update meal:', err);
      return res.status(500).json({ error: 'Failed to update meal' });
    }
    res.json({ message: 'Meal updated successfully' });
  });
});

// DELETE meal
app.delete('/api/meals/:id', (req, res) => {
  const mealId = req.params.id;
  
  const sql = 'DELETE FROM meals WHERE id = ?';
  db.query(sql, [mealId], (err, results) => {
    if (err) {
      console.error('❌ Failed to delete meal:', err);
      return res.status(500).json({ error: 'Failed to delete meal' });
    }
    res.json({ message: 'Meal deleted successfully' });
  });
});

// 🟢 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
