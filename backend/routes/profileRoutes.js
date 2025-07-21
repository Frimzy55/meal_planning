import express from 'express';
import {
  getProfileByIdHandler,
  saveProfileHandler
} from '../controllers/profileController.js';

const router = express.Router();

// GET /profile/:id → Get single profile by ID
router.get('/profile/:id', getProfileByIdHandler);

// POST /profile → Save profile
router.post('/profile', saveProfileHandler);

export default router;
