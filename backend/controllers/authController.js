import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel.js';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'user'
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

export const authController = {
  async signup(req, res) {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Check if user already exists (by email or name)
      //const existingUser = await userModel.findByEmailOrIndex(email, firstName);
      const existingUser = await userModel.findByEmailOrIndex(email, firstName, lastName);

      if (existingUser) return res.status(409).json({ error: 'User already exists' });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Save user
      await userModel.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'user'
      });

      res.status(201).json({ message: 'Student registered successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await userModel.findByEmail(email);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const token = generateToken(user);

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          firstName: user.first_name,   // ✅
          lastName: user.last_name,     // ✅ include last name
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
