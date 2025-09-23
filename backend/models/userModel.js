import pool from '../config/db.js';

export const userModel = {
  async create({ firstName, lastName, email, password, role }) {
    const [result] = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, password, role]
    );
    return result;
  },

  async findByEmailOrIndex(email, firstName, lastName) {
    const [rows] = await pool.query(
      `SELECT 
         id, 
         first_name,
         last_name,
         email, 
         role, 
         password 
       FROM users 
       WHERE email = ? OR first_name = ? OR last_name = ?`,
      [email, firstName, lastName]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const [rows] = await pool.query(
      `SELECT 
         id, 
         first_name,
         last_name,
         email, 
         role, 
         password 
       FROM users 
       WHERE email = ?`,
      [email]
    );
    return rows[0];
  }
};
