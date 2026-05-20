import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

// Inisialisasi Google Gemini murni untuk saran waktu
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// URL Endpoint dari Tim Data Science
const JALUR_MODEL_AI = process.env.AI_MODEL_URL || 'http://127.0.0.1:8000/api/predict';

/**
 * 1. FUNGSI MODEL DATA SCIENCE (Fokus Analisis Makanan & Prediksi Kalori)
 */
const panggilModelDataScience = async (foodName, userGoal) => {
    try {
        const response = await fetch(JALUR_MODEL_AI, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ food_name: foodName, goal: userGoal })
        });

        if (!response.ok) throw new Error('Respon server AI Data Science bermasalah');
        
        const hasilAI = await response.json();
        
        return {
            calories: hasilAI.kalori_prediksi || 0,
            analysis: hasilAI.analisis || 'Cocok untuk target nutrisi Anda.'
        };
    } catch (error) {
        console.error('Koneksi ke Model DS gagal:', error.message);
        return {
            calories: 0,
            analysis: `[Fallback DS] Analisis nutrisi untuk '${foodName}' sedang tidak tersedia. Perkirakan porsi sesuai target Anda.`
        };
    }
};

/**
 * 2. FUNGSI GOOGLE GEMINI (Fokus Saran Waktu & Kebiasaan Sehat)
 */
const getSaranWaktuGemini = async () => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Mengambil jam sistem saat ini
        const jamSekarang = new Date().getHours();
        
        const prompt = `Sebagai EatSistent (asisten virtual), berikan 1 kalimat dukungan atau saran singkat yang ramah (tanpa menyebutkan kalori/makanan spesifik) untuk pengguna yang mencatat makanannya pada jam ${jamSekarang}:00. Fokus pada pengingat waktu makan, ritme sirkadian, atau hidrasi.`;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        return "Tetap jaga pola makan teratur dan jangan lupa minum air putih yang cukup ya!";
    }
};


/**
 * ==========================================
 * CONTROLLER CRUD LOG MAKANAN
 * ==========================================
 */

// 1. CREATE (Simpan Log + Panggil DS + Panggil Gemini)
export const createFoodLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { foodName, calories } = req.body;

        if (!foodName) return res.status(400).json({ message: "Nama makanan wajib diisi!" });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const userGoal = user?.goal || "MAINTAIN";

        // Mengeksekusi kedua API secara bersamaan agar tidak memperlambat server
        const [hasilDS, saranWaktu] = await Promise.all([
            panggilModelDataScience(foodName, userGoal),
            getSaranWaktuGemini()
        ]);

        const kaloriFinal = calories ? parseFloat(calories) : hasilDS.calories;
        
        // Menggabungkan analisis makanan murni dengan saran waktu dari Gemini
        const teksAnalisisGabungan = `${hasilDS.analysis} Saran EatSistent: ${saranWaktu}`;

        const newFoodLog = await prisma.foodLog.create({
            data: {
                userId,
                foodName,
                calories: kaloriFinal,
                aiAnalysis: teksAnalisisGabungan
            }
        });

        res.status(201).json({ message: "Log makanan berhasil dicatat bersama analisis terpadu!", data: newFoodLog });
    } catch (err) {
        res.status(500).json({ message: "Gagal mencatat log makanan", error: err.message });
    }
};

// 2. READ ALL
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

// 3. READ SINGLE
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
        res.status(500).json({ message: "Gagal mengambil detail log", error: err.message });
    }
};

// 4. UPDATE
export const updateFoodLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const logId = parseInt(req.params.id);
        const { foodName, calories, aiAnalysis } = req.body;

        const existingLog = await prisma.foodLog.findFirst({
            where: { id: logId, userId }
        });

        if (!existingLog) return res.status(404).json({ message: "Data tidak ditemukan atau akses ditolak!" });

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
        res.status(500).json({ message: "Gagal memperbarui data", error: err.message });
    }
};

// 5. DELETE
export const deleteFoodLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const logId = parseInt(req.params.id);

        const existingLog = await prisma.foodLog.findFirst({
            where: { id: logId, userId }
        });

        if (!existingLog) return res.status(404).json({ message: "Data tidak ditemukan atau akses ditolak!" });

        await prisma.foodLog.delete({ where: { id: logId } });

        res.status(200).json({ message: "Log makanan berhasil dihapus dari riwayat!" });
    } catch (err) {
        res.status(500).json({ message: "Gagal menghapus log", error: err.message });
    }
};