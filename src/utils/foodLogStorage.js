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
