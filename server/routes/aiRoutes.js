import express from 'express';
import { chatWithNutritionAssistant } from '../controllers/aiController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/chat', verifyToken, chatWithNutritionAssistant);

export default router;
