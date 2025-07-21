//const Profile = require('../models/profileModel');
//import pool from '../config/db.js';
import { saveProfile } from '../models/profileModel.js';



export const saveProfileHandler = (req, res) => {
  const formData = req.body;
  saveProfile(formData, (err, result) => {
    if (err) {
      console.error('Error saving profile:', err);
      return res.status(500).json({ message: 'Failed to save profile' });
    }
    res.json({ message: 'Profile saved successfully' });
  });
};



import pool from '../config/db.js'; // your actual MySQL pool path

export const getProfileByIdHandler = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query('SELECT * FROM profiles WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





