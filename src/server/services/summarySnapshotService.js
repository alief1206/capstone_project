import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const startOfDay = (value = new Date()) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};

export const endOfDay = (value = new Date()) => {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date;
};

export const summarizeFoodLogs = (logs = []) => logs.reduce((summary, log) => ({
    totalCalories: summary.totalCalories + Number(log.calories || 0),
    protein: summary.protein + Number(log.protein || 0),
    carbs: summary.carbs + Number(log.carbs || 0),
    fat: summary.fat + Number(log.fat || 0),
    fiber: summary.fiber + Number(log.fiber || 0),
    totalLogs: summary.totalLogs + 1
}), { totalCalories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, totalLogs: 0 });

export const summarizeWeightLogs = (logs = [], range = 'weekly') => {
    if (!logs.length) {
        return {
            range,
            latestWeight: null,
            delta: 0,
            averageWeight: 0,
            minWeight: 0,
            maxWeight: 0,
            entries: 0
        };
    }

    const ordered = [...logs].sort((a, b) => new Date(a.logDate) - new Date(b.logDate));
    const weights = ordered.map((log) => Number(log.weight || 0));
    const latest = ordered[ordered.length - 1];
    const previous = ordered.length > 1 ? ordered[ordered.length - 2] : latest;

    return {
        range,
        latestWeight: latest.weight,
        delta: Number((latest.weight - previous.weight).toFixed(1)),
        averageWeight: Number((weights.reduce((sum, value) => sum + value, 0) / weights.length).toFixed(1)),
        minWeight: Math.min(...weights),
        maxWeight: Math.max(...weights),
        entries: logs.length
    };
};

export const saveSummarySnapshot = async ({ userId, type, summaryDate = new Date(), data }) => {
    const day = startOfDay(summaryDate);

    return prisma.summarySnapshot.upsert({
        where: {
            userId_type_summaryDate: {
                userId,
                type,
                summaryDate: day
            }
        },
        update: { data },
        create: {
            userId,
            type,
            summaryDate: day,
            data
        }
    });
};

export const buildWeeklyProgressSnapshot = async ({ userId, selectedDate = new Date() }) => {
    const end = endOfDay(selectedDate);
    const start = startOfDay(selectedDate);
    start.setDate(start.getDate() - 6);

    const [foodLogs, weightLogs] = await Promise.all([
        prisma.foodLog.findMany({
            where: { userId, logDate: { gte: start, lte: end } },
            orderBy: { logDate: 'asc' }
        }),
        prisma.weightLog.findMany({
            where: { userId, logDate: { gte: start, lte: end } },
            orderBy: { logDate: 'asc' }
        })
    ]);

    const nutritionSummary = summarizeFoodLogs(foodLogs);
    const weightSummary = summarizeWeightLogs(weightLogs, 'weekly');

    return {
        dateFrom: start.toISOString().slice(0, 10),
        dateTo: startOfDay(selectedDate).toISOString().slice(0, 10),
        nutritionSummary,
        weightSummary,
        foodLogCount: foodLogs.length,
        weightLogCount: weightLogs.length
    };
};

export const buildDailyInsightSnapshot = async ({ userId, selectedDate = new Date() }) => {
    const start = startOfDay(selectedDate);
    const end = endOfDay(selectedDate);
    const logs = await prisma.foodLog.findMany({
        where: { userId, logDate: { gte: start, lte: end } },
        orderBy: { createdAt: 'asc' }
    });

    return {
        date: start.toISOString().slice(0, 10),
        dailySummary: summarizeFoodLogs(logs),
        meals: logs.map((log) => ({
            id: log.id,
            foodName: log.foodName,
            mealType: log.mealType,
            calories: log.calories,
            protein: log.protein,
            carbs: log.carbs,
            fat: log.fat,
            fiber: log.fiber
        }))
    };
};
