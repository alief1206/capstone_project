import express from 'express';
import { 
    createFoodLog, 
    getAllFoodLogs, 
    getFoodLogById, 
    updateFoodLog, 
    deleteFoodLog,
    getNutritionSummaryDashboard // Import fungsi baru
} from '../controllers/foodLogController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route khusus penyuplai data terpadu untuk Dashboard, AI Insight, dan Ringkasan Minggu Ini
router.get('/summary-analytics', verifyToken, getNutritionSummaryDashboard);

router.post('/log-food', verifyToken, createFoodLog);      
router.get('/log-food', verifyToken, getAllFoodLogs);       
router.get('/log-food/:id', verifyToken, getFoodLogById);   
router.put('/log-food/:id', verifyToken, updateFoodLog);    
router.delete('/log-food/:id', verifyToken, deleteFoodLog); 

export default router;