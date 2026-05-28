import express from 'express';
import { createWeightLog, getMe, getWeightTrend, updatePhysicalData } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me', verifyToken, getMe);
router.put('/physical-update', verifyToken, updatePhysicalData);
router.post('/weight-logs', verifyToken, createWeightLog);
router.get('/weight-logs', verifyToken, getWeightTrend);

export default router;
