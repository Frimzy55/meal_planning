import pool from '../config/db.js';

export const userModel = {
  async create({ firstName, lastName, email, password, role }) {
    const [result] = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [firstName, lastName, email, password, role]
    );
    return result;
  },

  async findByEmailOrIndex(email, firstName) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? OR first_name = ?',
      [email, firstName]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }
};

