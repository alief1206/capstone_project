import express from 'express';
import { 
    createFoodLog, 
    getAllFoodLogs, 
    getFoodLogById, 
    updateFoodLog, 
    deleteFoodLog 
} from '../controllers/foodLogController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Semua endpoint dilindungi oleh token autentikasi JWT middleware
router.post('/log-food', verifyToken, createFoodLog);      // Create Log Makanan
router.get('/log-food', verifyToken, getAllFoodLogs);       // Read All Log Makanan
router.get('/log-food/:id', verifyToken, getFoodLogById);   // Read Single Log Makanan berdasarkan ID
router.put('/log-food/:id', verifyToken, updateFoodLog);    // Update Log Makanan berdasarkan ID
router.delete('/log-food/:id', verifyToken, deleteFoodLog); // Delete Log Makanan berdasarkan ID

export default router;