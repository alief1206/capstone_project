export const getFoodLogKey = (email = '') => `foodLogs:${email || 'guest'}`;

const mealTypeToMealId = {
    SARAPAN: 'sarapan',
    'MAKAN SIANG': 'makansiang',
    'MAKAN MALAM': 'makanmalam',
    CAMILAN: 'camilan'
};

const mealIdToMealType = {
    sarapan: 'SARAPAN',
    makansiang: 'MAKAN SIANG',
    makanmalam: 'MAKAN MALAM',
    camilan: 'CAMILAN'
};

const iconPresets = [
    { keywords: ['nasi', 'beras'], icon: 'mdi:rice', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' },
    { keywords: ['ayam', 'daging', 'sapi'], icon: 'mdi:food-drumstick', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' },
    { keywords: ['telur'], icon: 'mdi:egg', color: 'text-[#F97316]', bg: 'bg-[#FFF5EB]' },
    { keywords: ['roti', 'oat', 'mie'], icon: 'mdi:bread-slice', color: 'text-[#3B82F6]', bg: 'bg-[#F0F5FF]' },
    { keywords: ['sayur', 'bayam', 'brokoli', 'apel', 'pisang'], icon: 'mdi:leaf', color: 'text-[#14AE5C]', bg: 'bg-[#F0FDF4]' },
    { keywords: ['kacang', 'alpukat'], icon: 'mdi:peanut', color: 'text-[#8B5CF6]', bg: 'bg-[#F5F3FF]' }
];

const getFoodVisual = (foodName = '') => {
    const normalized = foodName.toLowerCase();
    return iconPresets.find((preset) => preset.keywords.some((keyword) => normalized.includes(keyword))) || {
        icon: 'mdi:food-variant',
        color: 'text-[#14AE5C]',
        bg: 'bg-[#F0FDF4]'
    };
};

export const parseCalories = (value) => {
    const match = String(value || '').match(/\d+/);
    return match ? Number(match[0]) : 0;
};

export const roundTwo = (value = 0) => Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

export const formatTwoDecimals = (value = 0) => roundTwo(value).toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export const getFoodLogs = (email = '') => {
    try {
        return JSON.parse(localStorage.getItem(getFoodLogKey(email))) || [];
    } catch {
        return [];
    }
};

export const saveFoodLogs = (email = '', logs = []) => {
    localStorage.setItem(getFoodLogKey(email), JSON.stringify(logs));
};

export const addFoodLog = (email = '', food) => {
    const logs = getFoodLogs(email);
    const selectedDate = food.logDate || food.createdAt || new Date().toISOString();
    saveFoodLogs(email, [normalizeFoodLogForStorage({ ...food, id: food.id || Date.now(), logDate: selectedDate, createdAt: food.createdAt || selectedDate }), ...logs]);
};

export const removeFoodLog = (email = '', foodId) => {
    const id = String(foodId);
    const remainingLogs = getFoodLogs(email).filter((food) => (
        String(food.id) !== id &&
        String(food.serverId || '') !== id
    ));
    saveFoodLogs(email, remainingLogs);
    return remainingLogs;
};

export const mergeFoodLogs = (email = '', incomingLogs = []) => {
    const byKey = new Map();
    [...incomingLogs, ...getFoodLogs(email)].forEach((log) => {
        const normalized = normalizeFoodLogForStorage(log);
        const key = normalized.serverId ? `server:${normalized.serverId}` : `local:${normalized.id}:${normalized.createdAt}`;
        byKey.set(key, normalized);
    });

    const merged = Array.from(byKey.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    saveFoodLogs(email, merged);
    return merged;
};

export const clearFoodLogs = (email = '') => {
    localStorage.removeItem(getFoodLogKey(email));
};

export const getTotalCalories = (logs = []) => {
    return roundTwo(logs.reduce((total, food) => total + Number(food.calories || 0), 0));
};

const macroPresets = [
    { keywords: ['ayam', 'daging', 'sapi', 'ikan', 'telur', 'tahu', 'tempe', 'susu'], ratios: { protein: 0.45, carbs: 0.15, fat: 0.4 } },
    { keywords: ['nasi', 'roti', 'mie', 'oat', 'pisang', 'apel', 'wortel'], ratios: { protein: 0.1, carbs: 0.78, fat: 0.12 } },
    { keywords: ['alpukat', 'kacang', 'selai'], ratios: { protein: 0.12, carbs: 0.18, fat: 0.7 } },
    { keywords: ['bayam', 'brokoli', 'salad', 'sayur'], ratios: { protein: 0.18, carbs: 0.7, fat: 0.12 } }
];

const defaultRatios = { protein: 0.2, carbs: 0.5, fat: 0.3 };

const getMacroRatios = (foodName = '') => {
    const normalizedName = foodName.toLowerCase();
    return macroPresets.find((preset) => preset.keywords.some((keyword) => normalizedName.includes(keyword)))?.ratios || defaultRatios;
};

export const estimateMacros = (food = {}) => {
    if (food.protein || food.carbs || food.fat) {
        return {
            protein: Number(food.protein || 0),
            carbs: Number(food.carbs || food.karbo || 0),
            fat: Number(food.fat || food.lemak || 0)
        };
    }

    const calories = Number(food.calories || 0);
    const ratios = getMacroRatios(food.name || food.foodName || '');
    return {
        protein: Math.round((calories * ratios.protein) / 4),
        carbs: Math.round((calories * ratios.carbs) / 4),
        fat: Math.round((calories * ratios.fat) / 9)
    };
};

export const normalizeFoodLogForStorage = (log = {}) => {
    const foodName = log.name || log.foodName || 'Makanan';
    const visual = getFoodVisual(foodName);
    const mealId = log.mealId || mealTypeToMealId[log.mealType] || 'makansiang';

    return {
        id: log.id || log.serverId || Date.now(),
        serverId: log.serverId || null,
        name: foodName,
        foodName,
        qty: log.qty || '1 porsi',
        calories: Number(log.calories || 0),
        protein: Number(log.protein || 0),
        carbs: Number(log.carbs || log.karbo || 0),
        fat: Number(log.fat || log.lemak || 0),
        fiber: Number(log.fiber || log.serat || 0),
        mealId,
        mealType: log.mealType || mealIdToMealType[mealId],
        icon: log.icon || visual.icon,
        color: log.color || visual.color,
        bg: log.bg || visual.bg,
        aiAnalysis: log.aiAnalysis || log.analysis || '',
        logDate: log.logDate || log.createdAt || new Date().toISOString(),
        createdAt: log.createdAt || log.logDate || new Date().toISOString()
    };
};

export const getMacroTotals = (logs = []) => {
    const totals = logs.reduce((acc, food) => {
        const macros = estimateMacros(food);
        return {
            protein: acc.protein + macros.protein,
            carbs: acc.carbs + macros.carbs,
            fat: acc.fat + macros.fat
        };
    }, { protein: 0, carbs: 0, fat: 0 });

    return {
        protein: roundTwo(totals.protein),
        carbs: roundTwo(totals.carbs),
        fat: roundTwo(totals.fat)
    };
};

export const getNutritionSummary = (logs = []) => {
    const macros = getMacroTotals(logs);
    return {
        calories: getTotalCalories(logs),
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        fiber: roundTwo(logs.reduce((total, food) => total + Number(food.fiber || 0), 0)),
        totalLogs: logs.length
    };
};

export const isSameCalendarDay = (dateA, dateB = new Date()) => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
};

export const getFoodLogsByDate = (email = '', date = new Date()) => {
    return getFoodLogs(email).filter((food) => isSameCalendarDay(food.logDate || food.createdAt, date));
};

export const getFoodLogsInLastDays = (email = '', days = 7) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));
    return getFoodLogs(email).filter((food) => new Date(food.logDate || food.createdAt) >= start);
};

export const getDailyCalorieBuckets = (logs = []) => {
    const buckets = logs.reduce((acc, food) => {
        const key = new Date(food.logDate || food.createdAt).toISOString().slice(0, 10);
        acc[key] = (acc[key] || 0) + Number(food.calories || 0);
        return acc;
    }, {});

    return Object.entries(buckets).map(([date, calories]) => ({ date, calories }));
};

export const getMacroSources = (logs = [], macroKey = 'protein') => {
    return logs
        .map((food) => {
            const macros = estimateMacros(food);
            return { name: food.name || food.foodName || 'Makanan', qty: `${macros[macroKey] || 0}g` };
        })
        .filter((source) => !source.qty.startsWith('0g'));
};
