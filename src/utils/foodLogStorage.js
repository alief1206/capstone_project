export const getFoodLogKey = (email = '') => `foodLogs:${email || 'guest'}`;

export const parseCalories = (value) => {
    const match = String(value || '').match(/\d+/);
    return match ? Number(match[0]) : 0;
};

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
    saveFoodLogs(email, [{ ...food, id: Date.now(), createdAt: new Date().toISOString() }, ...logs]);
};

export const clearFoodLogs = (email = '') => {
    localStorage.removeItem(getFoodLogKey(email));
};

export const getTotalCalories = (logs = []) => {
    return logs.reduce((total, food) => total + Number(food.calories || 0), 0);
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

export const getMacroTotals = (logs = []) => {
    return logs.reduce((totals, food) => {
        const macros = estimateMacros(food);
        return {
            protein: totals.protein + macros.protein,
            carbs: totals.carbs + macros.carbs,
            fat: totals.fat + macros.fat
        };
    }, { protein: 0, carbs: 0, fat: 0 });
};

export const getMacroSources = (logs = [], macroKey = 'protein') => {
    return logs
        .map((food) => {
            const macros = estimateMacros(food);
            return { name: food.name || food.foodName || 'Makanan', qty: `${macros[macroKey] || 0}g` };
        })
        .filter((source) => !source.qty.startsWith('0g'));
};
