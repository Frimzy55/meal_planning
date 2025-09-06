import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
//import mealPlanRoutes from "./routes/mealPlanRoutes.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);

//app.use("/api/meal-plan", mealPlanRoutes);
// Example protected and admin-only routes
import { authenticateToken, authorizeAdmin } from './middleware/authMiddleware.js';
//import { verifyToken, authorizeAdmin } from './middleware/authMiddleware.js';

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}! You accessed a protected route.` });
});

app.get('/api/admin/dashboard', authenticateToken, authorizeAdmin, (req, res) => {
  res.json({ message: `Hello Admin ${req.user.email}, welcome to the admin dashboard.` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
