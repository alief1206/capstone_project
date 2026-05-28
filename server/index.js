import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import foodLogRoutes from './routes/foodLogRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import foodCatalogRoutes from './routes/foodCatalogRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/food-logs', foodLogRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/foods', foodCatalogRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "Endpoint RESTful API tidak ditemukan!" });
});

app.listen(PORT, () => {
    console.log(`Server Back-End aktif dan berjalan aman di port ${PORT}`);
});
