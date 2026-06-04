import prisma from '../lib/prisma.js';
import { buildFoodNutrition } from '../services/aiIntegrationService.js';
import { saveSummarySnapshot } from '../services/summarySnapshotService.js';
import { endOfDay, getDateKey, isWithinLastSevenDaysCalendar, startOfDay } from '../utils/dateUtils.js';

const serializeFoodLog = (log) => ({
    id: log.id,
    userId: log.userId,
    foodName: log.foodName,
    mealType: log.mealType,
    calories: log.calories,
    protein: log.protein,
    carbs: log.carbs,
    fat: log.fat,
    fiber: log.fiber,
    aiAnalysis: log.aiAnalysis,
    logDate: getDateKey(log.logDate),
    createdAt: log.createdAt
});

const summarizeLogs = (logs = []) => logs.reduce((summary, log) => ({
    totalCalories: summary.totalCalories + Number(log.calories || 0),
    protein: summary.protein + Number(log.protein || 0),
    carbs: summary.carbs + Number(log.carbs || 0),
    fat: summary.fat + Number(log.fat || 0),
    fiber: summary.fiber + Number(log.fiber || 0),
    totalLogs: summary.totalLogs + 1
}), { totalCalories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, totalLogs: 0 });

const groupByDay = (logs = []) => Object.values(logs.reduce((days, log) => {
    const key = getDateKey(log.logDate || log.createdAt);
    if (!days[key]) days[key] = { date: key, logs: [], totalCalories: 0 };
    days[key].logs.push(log);
    days[key].totalCalories += Number(log.calories || 0);
    return days;
}, {}));

// 1. CREATE LOG (Dengan validasi blokir makanan berat masuk camilan)
export const createFoodLog = async (req, res) => {
    try {
        const userId = req.user.id;
        const { foodName, calories, mealType, logDate } = req.body; // mealType bisa dikirim dari frontend: 'SARAPAN', 'MAKAN SIANG', 'MAKAN MALAM', atau 'CAMILAN'

        if (!foodName) return res.status(400).json({ message: "Nama makanan wajib diisi!" });
        const selectedLogDate = logDate || new Date();
        if (!isWithinLastSevenDaysCalendar(selectedLogDate)) {
            return res.status(400).json({ message: "Pencatatan makanan hanya bisa dilakukan untuk hari ini sampai 7 hari ke belakang." });
        }

        // Poin 6: Validasi Pemblokiran Kata Kunci Makanan Berat ke dalam Camilan
        const daftarMakananBerat = ['nasi', 'mie', 'gulai', 'sate', 'rawon', 'bakso', 'rendang', 'ayam goreng'];
        const isMakananBerat = daftarMakananBerat.some(keyword => foodName.toLowerCase().includes(keyword));

        if (mealType === 'CAMILAN' && isMakananBerat) {
            return res.status(400).json({ 
                message: `Validasi Gagal: '${foodName}' diklasifikasikan sebagai makanan berat di sistem EatSistent, tidak boleh dimasukkan ke dalam menu Camilan harian.` 
            });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const hasilNutrisi = await buildFoodNutrition({ foodName, calories, user });

        const newFoodLog = await prisma.foodLog.create({
            data: {
                userId,
                foodName,
                mealType,
                calories: hasilNutrisi.calories,
                protein: hasilNutrisi.protein,
                carbs: hasilNutrisi.carbs,
                fat: hasilNutrisi.fat,
                fiber: hasilNutrisi.fiber,
                aiAnalysis: hasilNutrisi.analysis,
                logDate: startOfDay(selectedLogDate)
            }
        });

        res.status(201).json({ message: "Log makanan berhasil dicatat!", data: serializeFoodLog(newFoodLog), aiTarget: hasilNutrisi.targetPrediction });
    } catch (err) {
        res.status(500).json({ message: "Gagal mencatat log", error: err.message });
    }
};

// Poin 1, 2, 3: ENDPOINT STATISTIK TERPADU UNTUK DASHBOARD, AI INSIGHT & MINGGUAN
export const getNutritionSummaryDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const selectedDate = req.query.date || new Date();
        const todayStart = startOfDay(selectedDate);
        const todayEnd = endOfDay(selectedDate);

        const dailyLogs = await prisma.foodLog.findMany({
            where: {
                userId,
                logDate: { gte: todayStart, lte: todayEnd }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Ambil data log 7 hari terakhir berdasarkan tanggal yang sedang dipilih pengguna.
        const tujuhHariLalu = startOfDay(selectedDate);
        tujuhHariLalu.setDate(tujuhHariLalu.getDate() - 6);
        tujuhHariLalu.setHours(0, 0, 0, 0);

        const awalBulan = startOfDay(selectedDate);
        awalBulan.setDate(1);
        awalBulan.setHours(0, 0, 0, 0);

        const logs = await prisma.foodLog.findMany({
            where: {
                userId,
                logDate: { gte: tujuhHariLalu, lte: todayEnd }
            },
            orderBy: { logDate: 'asc' }
        });

        const monthlyLogs = await prisma.foodLog.findMany({
            where: {
                userId,
                logDate: { gte: awalBulan, lte: todayEnd }
            },
            orderBy: { logDate: 'asc' }
        });

        // Hitung total kalori untuk Ringkasan Minggu Ini
        const totalKaloriMingguan = logs.reduce((sum, item) => sum + (item.calories || 0), 0);
        const rataRataKaloriHarian = logs.length > 0 ? (totalKaloriMingguan / 7).toFixed(0) : 0;

        // Mengumpulkan daftar Insight AI terakhir dari diary untuk disajikan di halaman AI Insight
        const kumpulanInsightAI = logs.map(l => ({ tanggal: l.logDate || l.createdAt, catatan: l.aiAnalysis })).filter(i => i.catatan !== null);
        const dailySummary = summarizeLogs(dailyLogs);
        const weeklyDays = groupByDay(logs);
        const consistencyDays = weeklyDays.length;

        const weeklySummary = {
            ...summarizeLogs(logs),
            totalCalories: totalKaloriMingguan,
            averageCaloriesPerDay: parseFloat(rataRataKaloriHarian),
            chartData: weeklyDays
        };
        const dailyInsightSnapshotData = {
            date: getDateKey(todayStart),
            dailySummary,
            dailyLogs: dailyLogs.map(serializeFoodLog),
            aiInsightsPool: kumpulanInsightAI.slice(-5)
        };
        const weeklyProgressSnapshotData = {
            dateFrom: getDateKey(tujuhHariLalu),
            dateTo: getDateKey(todayStart),
            consistency: {
                daysWithLogs: consistencyDays,
                label: `${consistencyDays} hari aktif dalam 7 hari terakhir`
            },
            weeklySummary
        };

        const [dailyInsightSnapshot, weeklyProgressSnapshot] = await Promise.all([
            saveSummarySnapshot({
                userId,
                type: 'DAILY_INSIGHT',
                summaryDate: todayStart,
                data: dailyInsightSnapshotData
            }),
            saveSummarySnapshot({
                userId,
                type: 'WEEKLY_PROGRESS',
                summaryDate: todayStart,
                data: weeklyProgressSnapshotData
            })
        ]);

        res.status(200).json({
            message: "Berhasil mengompilasi data Diary harian untuk statistik",
            dashboardData: {
                totalLogsCount: dailyLogs.length,
                lastMeal: dailyLogs[dailyLogs.length - 1] || null
            },
            dailySummary,
            dailyLogs: dailyLogs.map(serializeFoodLog),
            consistency: {
                daysWithLogs: consistencyDays,
                label: `${consistencyDays} hari aktif dalam 7 hari terakhir`
            },
            monthlySummary: summarizeLogs(monthlyLogs),
            weeklySummary,
            aiInsightsPool: kumpulanInsightAI.slice(-5), // kirim 5 insight terbaru harian
            savedSnapshots: {
                dailyInsightId: dailyInsightSnapshot.id,
                weeklyProgressId: weeklyProgressSnapshot.id
            }
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

        res.status(200).json({ message: "Log makanan berhasil diambil", data: logs.map(serializeFoodLog) });
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

        res.status(200).json({ message: "Log makanan berhasil diambil", data: serializeFoodLog(log) });
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil detail log makanan", error: err.message });
    }
};
export const updateFoodLog = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { foodName, calories, mealType, logDate } = req.body;

        const existing = await prisma.foodLog.findFirst({ where: { id, userId: req.user.id } });
        if (!existing) return res.status(404).json({ message: "Log makanan tidak ditemukan!" });
        if (logDate && !isWithinLastSevenDaysCalendar(logDate)) {
            return res.status(400).json({ message: "Log makanan hanya bisa disimpan untuk hari ini sampai 7 hari ke belakang." });
        }

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        const nutrition = await buildFoodNutrition({
            foodName: foodName || existing.foodName,
            calories: calories ?? existing.calories,
            user
        });

        const updated = await prisma.foodLog.update({
            where: { id },
            data: {
                foodName: foodName || existing.foodName,
                mealType: mealType || existing.mealType,
                calories: nutrition.calories,
                protein: nutrition.protein,
                carbs: nutrition.carbs,
                fat: nutrition.fat,
                fiber: nutrition.fiber,
                aiAnalysis: nutrition.analysis,
                ...(logDate ? { logDate: startOfDay(logDate) } : {})
            }
        });

        res.status(200).json({ message: "Log makanan berhasil diperbarui", data: serializeFoodLog(updated) });
    } catch (err) {
        res.status(500).json({ message: "Gagal memperbarui log makanan", error: err.message });
    }
};

export const deleteFoodLog = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const existing = await prisma.foodLog.findFirst({ where: { id, userId: req.user.id } });
        if (!existing) return res.status(404).json({ message: "Log makanan tidak ditemukan!" });

        await prisma.foodLog.delete({ where: { id } });
        res.status(200).json({ message: "Log makanan berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ message: "Gagal menghapus log makanan", error: err.message });
    }
};
