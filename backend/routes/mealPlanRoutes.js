// routes/mealPlanRoutes.js
// routes/mealPlanRoutes.js
import express from "express";
import { getMealPlan } from "../controllers/mealPlanController.js";

const router = express.Router();

router.get("/", getMealPlan);

export default router;

