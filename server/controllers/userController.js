import Joi from 'joi';
import prisma from '../lib/prisma.js';
import { predictNutritionTarget } from '../services/aiIntegrationService.js';
import {
    buildDailyInsightSnapshot,
    buildWeeklyProgressSnapshot,
    saveSummarySnapshot,
    summarizeWeightLogs
} from '../services/summarySnapshotService.js';
import { getDateKey, startOfDay } from '../utils/dateUtils.js';

const serializeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    goal: user.goal,
    age: user.age,
    gender: user.gender,
    height: user.height,
    currentWeight: user.currentWeight,
    targetWeight: user.targetWeight,
    activity: user.activity,
    habits: user.habits
});

const goalMapToDatabase = {
    turunkan: 'LOSE_WEIGHT',
    tambah: 'GAIN_WEIGHT',
    jaga: 'MAINTAIN',
    LOSE_WEIGHT: 'LOSE_WEIGHT',
    GAIN_WEIGHT: 'GAIN_WEIGHT',
    MAINTAIN: 'MAINTAIN'
};

const getRangeStart = (range = 'weekly') => {
    const start = startOfDay();
    if (range === 'monthly') {
        start.setMonth(start.getMonth() - 1);
        return start;
    }
    if (range === 'quarterly') {
        start.setMonth(start.getMonth() - 3);
        return start;
    }
    start.setDate(start.getDate() - 6);
    return start;
};

export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ message: "Pengguna tidak ditemukan!" });

        const aiTarget = await predictNutritionTarget(user);
        res.status(200).json({ message: "Profil berhasil diambil", data: serializeUser(user), aiTarget });
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil profil", error: err.message });
    }
};

export const updatePhysicalData = async (req, res) => {
    const schema = Joi.object({
        age: Joi.number().integer().positive().required(),
        gender: Joi.string().valid('pria', 'wanita').optional(),
        height: Joi.number().positive().required(),
        currentWeight: Joi.number().positive().required(),
        targetWeight: Joi.number().positive().required(),
        activity: Joi.string().valid('rendah', 'sedang', 'aktif', 'sangat').optional(),
        habits: Joi.array().items(Joi.string()).optional(),
        goal: Joi.string().valid('turunkan', 'tambah', 'jaga', 'LOSE_WEIGHT', 'GAIN_WEIGHT', 'MAINTAIN').required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const userId = req.user.id;
        const { age, gender, height, currentWeight, targetWeight, activity, habits } = req.body;
        const goal = goalMapToDatabase[req.body.goal] || req.body.goal;

        if (goal === 'LOSE_WEIGHT' && targetWeight >= currentWeight) {
            return res.status(400).json({ 
                message: "Validasi Gagal: Pilihan Anda adalah menurunkan berat badan, maka target berat badan harus lebih rendah dari berat badan saat ini." 
            });
        }

        if (goal === 'GAIN_WEIGHT' && targetWeight <= currentWeight) {
            return res.status(400).json({ 
                message: "Validasi Gagal: Pilihan Anda adalah menaikkan berat badan, maka target berat badan harus lebih tinggi dari berat badan saat ini." 
            });
        }

        if (goal === 'MAINTAIN' && targetWeight !== currentWeight) {
            return res.status(400).json({ 
                message: "Validasi Gagal: Pilihan Anda adalah mempertahankan berat badan, maka target berat badan harus sama dengan berat badan saat ini." 
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { age, gender, height, currentWeight, targetWeight, activity, habits, goal }
        });

        await prisma.weightLog.upsert({
            where: {
                userId_logDate: {
                    userId,
                    logDate: startOfDay()
                }
            },
            update: { weight: Number(currentWeight) },
            create: {
                userId,
                weight: Number(currentWeight),
                logDate: startOfDay()
            }
        });

        const aiTarget = await predictNutritionTarget(updatedUser);
        const [weeklyProgress, dailyInsight] = await Promise.all([
            buildWeeklyProgressSnapshot({ userId, selectedDate: new Date() }),
            buildDailyInsightSnapshot({ userId, selectedDate: new Date() })
        ]);
        const goalTargetSnapshot = await saveSummarySnapshot({
            userId,
            type: 'GOAL_TARGET_CONTEXT',
            summaryDate: new Date(),
            data: {
                profile: serializeUser(updatedUser),
                aiTarget,
                weeklyProgress,
                dailyInsight
            }
        });

        res.status(200).json({
            message: "Data fisik berhasil divalidasi dan diperbarui!",
            data: serializeUser(updatedUser),
            aiTarget,
            savedSnapshot: {
                goalTargetContextId: goalTargetSnapshot.id
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Gagal memperbarui data fisik", error: err.message });
    }
};

export const createWeightLog = async (req, res) => {
    const schema = Joi.object({
        weight: Joi.number().positive().required(),
        logDate: Joi.date().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const userId = req.user.id;
        const logDate = startOfDay(req.body.logDate || new Date());
        const weight = Number(req.body.weight);

        const [log] = await prisma.$transaction([
            prisma.weightLog.upsert({
                where: { userId_logDate: { userId, logDate } },
                update: { weight },
                create: { userId, weight, logDate }
            }),
            prisma.user.update({
                where: { id: userId },
                data: { currentWeight: weight }
            })
        ]);

        res.status(200).json({ message: "Berat badan harian berhasil dicatat", data: log });
    } catch (err) {
        res.status(500).json({ message: "Gagal mencatat berat badan", error: err.message });
    }
};

export const getWeightTrend = async (req, res) => {
    try {
        const userId = req.user.id;
        const range = ['weekly', 'monthly', 'quarterly'].includes(req.query.range) ? req.query.range : 'weekly';
        const dateFrom = getRangeStart(range);

        const logs = await prisma.weightLog.findMany({
            where: {
                userId,
                logDate: { gte: dateFrom }
            },
            orderBy: { logDate: 'asc' }
        });

        const weeklySummary = summarizeWeightLogs(logs.filter((log) => log.logDate >= getRangeStart('weekly')), 'weekly');
        const monthlySummary = summarizeWeightLogs(logs.filter((log) => log.logDate >= getRangeStart('monthly')), 'monthly');

        if (range === 'weekly') {
            await saveSummarySnapshot({
                userId,
                type: 'WEEKLY_PROGRESS',
                summaryDate: new Date(),
                data: {
                    dateFrom: getDateKey(getRangeStart('weekly')),
                    dateTo: getDateKey(),
                    weightSummary: weeklySummary,
                    weightLogs: logs.map((log) => ({
                        id: log.id,
                        weight: log.weight,
                        logDate: log.logDate
                    }))
                }
            });
        }

        res.status(200).json({
            message: "Trend berat badan berhasil diambil",
            summary: summarizeWeightLogs(logs, range),
            weeklySummary,
            monthlySummary,
            data: logs
        });
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil trend berat badan", error: err.message });
    }
};
