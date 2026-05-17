import express from 'express';
import { updatePhysicalData } from '../controllers/userController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.put('/physical-update', verifyToken, updatePhysicalData);

export default router;