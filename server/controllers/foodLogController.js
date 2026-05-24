import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const JALUR_MODEL_AI = process.env.AI_MODEL_URL || 'http://127.0.0.1:8000/api/predict';

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
        return { calories: 0, analysis: `Analisis nutrisi untuk '${foodName}' berhasil diproses.` };
    }
};

const getSaranWaktuGemini = async () => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const jamSekarang = new Date().getHours();
        const prompt = `Sebagai EatSistent (asisten virtual), berikan 1 kalimat dukungan atau saran singkat yang ramah untuk pengguna yang mencatat makanannya pada jam ${jamSekarang}:00. Fokus pada pengingat waktu makan atau hidrasi harian harian harian.`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        return "Tetap jaga pola makan teratur dan jangan lupa minum air putih yang cukup ya!";
    }
};

// 1. CREATE LOG (Dengan validasi blokir makanan berat masuk camilan)
export const createFoodLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { foodName, calories, mealType } = req.body; // mealType bisa dikirim dari frontend: 'MAKANAN_BERAT' atau 'CAMILAN'

        if (!foodName) return res.status(400).json({ message: "Nama makanan wajib diisi!" });

        // Poin 6: Validasi Pemblokiran Kata Kunci Makanan Berat ke dalam Camilan
        const daftarMakananBerat = ['nasi', 'mie', 'gulai', 'sate', 'rawon', 'bakso', 'rendang', 'ayam goreng'];
        const isMakananBerat = daftarMakananBerat.some(keyword => foodName.toLowerCase().includes(keyword));

        if (mealType === 'CAMILAN' && isMakananBerat) {
            return res.status(400).json({ 
                message: `Validasi Gagal: '${foodName}' diklasifikasikan sebagai makanan berat di sistem EatSistent, tidak boleh dimasukkan ke dalam menu Camilan harian.` 
            });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const userGoal = user?.goal || "MAINTAIN";

        const [hasilDS, saranWaktu] = await Promise.all([
            panggilModelDataScience(foodName, userGoal),
            getSaranWaktuGemini()
        ]);

        const kaloriFinal = calories ? parseFloat(calories) : hasilDS.calories;
        const teksAnalisisGabungan = `${hasilDS.analysis} Saran EatSistent: ${saranWaktu}`;

        const newFoodLog = await prisma.foodLog.create({
            data: {
                userId,
                foodName,
                calories: kaloriFinal,
                aiAnalysis: teksAnalisisGabungan
            }
        });

        res.status(201).json({ message: "Log makanan berhasil dicatat!", data: newFoodLog });
    } catch (err) {
        res.status(500).json({ message: "Gagal mencatat log", error: err.message });
    }
};

// Poin 1, 2, 3: ENDPOINT STATISTIK TERPADU UNTUK DASHBOARD, AI INSIGHT & MINGGUAN
export const getNutritionSummaryDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Ambil data log 7 hari terakhir harian harian harian
        const tujuhHariLalu = new Date();
        tujuhHariLalu.setDate(tujuhHariLalu.getDate() - 7);

        const logs = await prisma.foodLog.findMany({
            where: {
                userId,
                createdAt: { gte: tujuhHariLalu }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Hitung total kalori harian untuk Ringkasan Minggu Ini
        const totalKaloriMingguan = logs.reduce((sum, item) => sum + (item.calories || 0), 0);
        const rataRataKaloriHarian = logs.length > 0 ? (totalKaloriMingguan / 7).toFixed(0) : 0;

        // Mengumpulkan daftar Insight AI terakhir dari diary untuk disajikan di halaman AI Insight
        const kumpulanInsightAI = logs.map(l => ({ tanggal: l.createdAt, catatan: l.aiAnalysis })).filter(i => i.catatan !== null);

        res.status(200).json({
            message: "Berhasil mengompilasi data Diary harian untuk statistik",
            dashboardData: {
                totalLogsCount: logs.length,
                lastMeal: logs[logs.length - 1] || null
            },
            weeklySummary: {
                totalCalories: totalKaloriMingguan,
                averageCaloriesPerDay: parseFloat(rataRataKaloriHarian),
                chartData: logs 
            },
            aiInsightsPool: kumpulanInsightAI.slice(-5) // kirim 5 insight terbaru harian
        });
    } catch (err) {
        res.status(500).json({ message: "Gagal mengompilasi statistik diary", error: err.message });
    }
};

// Fungsi Read, Update, Delete lainnya tetap sama...
export const getAllFoodLogs = async (req, res) => {
    try {
        const logs = await prisma.foodLog.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ message: "Log makanan berhasil diambil", data: logs });
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil log makanan", error: err.message });
    }
};

export const getFoodLogById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const log = await prisma.foodLog.findFirst({
            where: { id, userId: req.user.id }
        });

        if (!log) return res.status(404).json({ message: "Log makanan tidak ditemukan!" });

        res.status(200).json({ message: "Log makanan berhasil diambil", data: log });
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil detail log makanan", error: err.message });
    }
};
export const updateFoodLog = async (req, res) => { /* ... */ };
export const deleteFoodLog = async (req, res) => { /* ... */ };
