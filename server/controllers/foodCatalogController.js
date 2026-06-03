import prisma from '../lib/prisma.js';
import { findNutritionFromDataset, getNutritionCatalogRecommendations, searchNutritionCatalog } from '../services/aiIntegrationService.js';

const goalMapToUi = {
    LOSE_WEIGHT: 'turunkan',
    GAIN_WEIGHT: 'tambah',
    MAINTAIN: 'jaga'
};

const normalizeGoal = (goal = 'jaga') => goalMapToUi[goal] || goal || 'jaga';

const uniqueByName = (items = []) => {
    const seen = new Set();
    return items.filter((item) => {
        const key = String(item.name || '').toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const recentLogToCatalogItem = (log) => {
    const match = findNutritionFromDataset(log.foodName);

    return {
        id: `recent-${log.id}`,
        name: log.foodName,
        qty: '1 porsi',
        calories: Number(log.calories || match?.calories || 0),
        cals: `${Number(log.calories || match?.calories || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kkal`,
        protein: Number(log.protein || match?.protein || 0),
        carbs: Number(log.carbs || match?.carbs || 0),
        fat: Number(log.fat || match?.fat || 0),
        fiber: Number(log.fiber || match?.fiber || 0),
        category: match?.category || 'Riwayat',
        label: match?.label || 'Riwayat'
    };
};

export const getFoodCatalog = async (req, res) => {
    try {
        const query = String(req.query.q || '').trim();
        const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 50);
        const recommendationLimit = Math.min(Math.max(Number(req.query.recommendationLimit || 24), 1), 50);

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        const goal = normalizeGoal(req.query.goal || user?.goal);

        const [recentLogs] = await Promise.all([
            prisma.foodLog.findMany({
                where: { userId: req.user.id },
                orderBy: { createdAt: 'desc' },
                take: 8
            })
        ]);

        const foods = searchNutritionCatalog({ query, goal, limit });
        const recommendations = getNutritionCatalogRecommendations({ goal, limit: recommendationLimit });
        const recent = uniqueByName(recentLogs.map(recentLogToCatalogItem)).slice(0, 6);

        res.status(200).json({
            message: "Katalog makanan data-science berhasil diambil",
            data: {
                query,
                goal,
                recommendationLimit,
                recent,
                recommendations,
                foods
            }
        });
    } catch (err) {
        res.status(500).json({ message: "Gagal mengambil katalog makanan", error: err.message });
    }
};
