import express from 'express';
import { getFoodCatalog } from '../controllers/foodCatalogController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getFoodCatalog);

export default router;
