import express from 'express';
import { createFoodLog } from '../controllers/foodLogController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/log-food', verifyToken, createFoodLog);

export default router;