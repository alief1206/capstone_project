import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { askGeminiNutritionAssistant } from '../services/aiIntegrationService.js';

const prisma = new PrismaClient();

export const chatWithNutritionAssistant = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !String(message).trim()) {
            return res.status(400).json({ message: "Pertanyaan wajib diisi!" });
        }

        const [user, recentLogs] = await Promise.all([
            prisma.user.findUnique({ where: { id: req.user.id } }),
            prisma.foodLog.findMany({
                where: { userId: req.user.id },
                orderBy: { createdAt: 'desc' },
                take: 8
            })
        ]);

        const reply = await askGeminiNutritionAssistant({
            message: String(message).trim(),
            user,
            recentLogs
        });

        res.status(200).json({ message: "Jawaban AI berhasil dibuat", data: { reply } });
    } catch (err) {
        res.status(500).json({ message: "Gagal meminta jawaban Gemini", error: err.message });
    }
};
