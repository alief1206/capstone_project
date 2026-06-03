import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import foodLogRoutes from './routes/foodLogRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import foodCatalogRoutes from './routes/foodCatalogRoutes.js';
import prisma from './lib/prisma.js';

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Origin tidak diizinkan oleh konfigurasi CORS.'));
    },
    credentials: true
}));
app.use(express.json());

app.get('/api/v1/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            database: 'disconnected',
            message: error.message
        });
    }
});

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
