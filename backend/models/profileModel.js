import pool from '../config/db.js';



export const saveProfile = (data, callback) => {
  const sql = `
    INSERT INTO profiles 
    (id,fullName, age, gender, height, weight, goal, activityLevel, medicalConditions, dietType, culturalPreference, religiousRestrictions, dislikedFoods, mealsPerDay, breakfastTime, lunchTime, dinnerTime)
    VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  pool.query(sql, [
    data.id,
    data.fullName,
    data.age,
    data.gender,
    data.height,
    data.weight,
    data.goal,
    data.activityLevel,
    data.medicalConditions.join(','), // Store as CSV
    data.dietType,
    data.culturalPreference,
    data.religiousRestrictions,
    data.dislikedFoods,
    data.mealsPerDay,
    data.mealTimes.breakfast,
    data.mealTimes.lunch,
    data.mealTimes.dinner
  ], callback);
};



/*export const getProfile = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM profiles LIMIT 1');
    return rows;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};*/


//const db = require('../config/db'); // your DB connection file

/*exports.findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM profiles WHERE profile_id = ?', [id]);
  return rows[0]; // assuming unique id
};*/










//import db from '../db.js';

/*export const saveProfile = (data, callback) => {
  const {
    userId,
    fullName, age, gender, height, weight,
    goal, activityLevel, medicalConditions,
    dietType, culturalPreference, religiousRestrictions,
    dislikedFoods, mealsPerDay, mealTimes
  } = data;

  const medicalStr = JSON.stringify(medicalConditions);
  const mealTimesStr = JSON.stringify(mealTimes);

  const sql = `
    INSERT INTO profile (
      user_id, fullName, age, gender, height, weight,
      goal, activityLevel, medicalConditions,
      dietType, culturalPreference, religiousRestrictions,
      dislikedFoods, mealsPerDay, mealTimes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    userId, fullName, age, gender, height, weight,
    goal, activityLevel, medicalStr,
    dietType, culturalPreference, religiousRestrictions,
    dislikedFoods, mealsPerDay, mealTimesStr
  ];

  db.query(sql, values, callback);
};*/
