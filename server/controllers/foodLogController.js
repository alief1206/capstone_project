import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

/**
 * LOGIKA INTEGRASI DENGAN MODEL DATA SCIENCE / AI ENGINEER
 * Gantilah URL_API_MODEL_AI dengan endpoint server Flask/FastAPI milik tim AI Anda.
 */
const JALUR_MODEL_AI = process.env.AI_MODEL_URL || 'http://127.0.0.1:8000/api/predict';

const panggilModelDataScience = async (foodName, userGoal) => {
    try {
        // Melakukan networking call ke server milik AI Engineer menggunakan native fetch
        const response = await fetch(JALUR_MODEL_AI, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                food_name: foodName,
                goal: userGoal
            })
        });

        if (!response.ok) throw new Error('Respon server AI bermasalah');
        
        const hasilAI = await response.json();
        
        // Asumsi format respon dari tim Data Science: { kalori_prediksi: 250, analisis: "..." }
        return {
            calories: hasilAI.kalori_prediksi || 0,
            analysis: hasilAI.analisis || 'Analisis berhasil diproses oleh model eksternal.'
        };
    } catch (error) {
        console.error('Koneksi ke Model AI Tim Desain/AI gagal:', error.message);
        // Fallback otomatis jika server AI milik tim mengalami kendala/down agar aplikasi front-end tidak crash
        return {
            calories: 0,
            analysis: `[Fallback] Gagal terhubung ke model AI internal. Menu '${foodName}' berhasil dicatat, harap periksa porsi Anda.`
        };
    }
};

// 1. CREATE (Membuat log makanan baru + Panggil Model AI)
export const createFoodLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { foodName, calories } = req.body;

        if (!foodName) return res.status(400).json({ message: "Nama makanan wajib diisi!" });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const userGoal = user?.goal || "MAINTAIN";

        // Eksekusi pemanggilan ke model Data Science/AI Engineer
        const hasilPrediksiAI = await panggilModelDataScience(foodName, userGoal);

        // Jika kalori tidak dikirim dari front-end, gunakan kalori hasil kalkulasi model Data Science
        const kaloriFinal = calories ? parseFloat(calories) : hasilPrediksiAI.calories;

        const newFoodLog = await prisma.foodLog.create({
            data: {
                userId,
                foodName,
                calories: kaloriFinal,
                aiAnalysis: hasilPrediksiAI.analysis
            }
        });

        res.status(201).json({ message: "Log makanan berhasil dicatat bersama analisis cerdas!", data: newFoodLog });
    } catch (err) {
        res.status(500).json({ message: "Gagal mencatat log makanan", error: err.message });
    }
};

// 2. READ ALL (Mengambil semua log makanan milik user yang sedang login)
export const getAllFoodLogs = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const logs = await prisma.foodLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ message: "Berhasil mengambil riwayat log makanan", data: logs });
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil log makanan", error: err.message });
    }
};

// 3. READ SINGLE (Mengambil satu log makanan berdasarkan ID berkas)
export const getFoodLogById = async (req, res) => {
    try {
        const userId = req.user.id;
        const logId = parseInt(req.params.id);

        const log = await prisma.foodLog.findFirst({
            where: { id: logId, userId }
        });

        if (!log) return res.status(404).json({ message: "Data log makanan tidak ditemukan!" });

        res.status(200).json({ message: "Detail log makanan berhasil ditemukan", data: log });
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil detail log makanan", error: err.message });
    }
};

// 4. UPDATE (Memperbarui data log makanan yang sudah ada)
export const updateFoodLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const logId = parseInt(req.params.id);
        const { foodName, calories, aiAnalysis } = req.body;

        // Validasi kepemilikan data sebelum melakukan update
        const existingLog = await prisma.foodLog.findFirst({
            where: { id: logId, userId }
        });

        if (!existingLog) return res.status(404).json({ message: "Data tidak ditemukan atau Anda tidak memiliki akses!" });

        const updatedLog = await prisma.foodLog.update({
            where: { id: logId },
            data: {
                foodName: foodName || existingLog.foodName,
                calories: calories ? parseFloat(calories) : existingLog.calories,
                aiAnalysis: aiAnalysis || existingLog.aiAnalysis
            }
        });

        res.status(200).json({ message: "Log makanan berhasil diperbarui!", data: updatedLog });
    } catch (err) {
        res.status(500).json({ message: "Gagal memperbarui data log makanan", error: err.message });
    }
};

// 5. DELETE (Menghapus log makanan dari database)
export const deleteFoodLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const logId = parseInt(req.params.id);

        const existingLog = await prisma.foodLog.findFirst({
            where: { id: logId, userId }
        });

        if (!existingLog) return res.status(404).json({ message: "Data tidak ditemukan atau Anda tidak memiliki akses!" });

        await prisma.foodLog.delete({
            where: { id: logId }
        });

        res.status(200).json({ message: "Log makanan berhasil dihapus dari riwayat basis data harian!" });
    } catch (err) {
        res.status(500).json({ message: "Gagal menghapus data log makanan", error: err.message });
    }
};