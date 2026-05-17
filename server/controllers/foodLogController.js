import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const processAIAnalysis = (foodName, userGoal) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`[MOCK AI ASSISTANT] Hasil analisis menu '${foodName}': Komposisi gizi dinilai cukup serasi dengan target manajemen program ${userGoal} Anda. Jaga konsumsi air putih.`);
        }, 1200); 
    });
};

export const createFoodLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { foodName, calories } = req.body;

        if (!foodName) return res.status(400).json({ message: "Nama makanan wajib diisi!" });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const userGoal = user?.goal || "MAINTAIN";

        const aiAnalysisText = await processAIAnalysis(foodName, userGoal);

        const newFoodLog = await prisma.foodLog.create({
            data: {
                userId,
                foodName,
                calories: calories ? parseFloat(calories) : 0,
                aiAnalysis: aiAnalysisText
            }
        });

        res.status(201).json({ message: "Log makanan berhasil dicatat bersama analisis cerdas!", data: newFoodLog });
    } catch (err) {
        res.status(500).json({ message: "Gagal mencatat log makanan", error: err.message });
    }
};