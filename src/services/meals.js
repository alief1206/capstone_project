import { apiRequest } from './api.js';
import { mergeFoodLogs, normalizeFoodLogForStorage, saveFoodLogs } from '../utils/foodLogStorage.js';
import { toLocalDateKey } from '../utils/dateUtils.js';

export const fetchFoodLogs = async (email = '') => {
    const response = await apiRequest('/food-logs/log-food');
    const logs = (response.data || []).map((log) => normalizeFoodLogForStorage({ ...log, serverId: log.id }));
    saveFoodLogs(email, logs);
    return logs;
};

export const createFoodLog = async (foodPayload) => {
    const response = await apiRequest('/food-logs/log-food', {
        method: 'POST',
        body: foodPayload
    });

    return {
        ...response,
        data: normalizeFoodLogForStorage({ ...response.data, serverId: response.data?.id })
    };
};

export const fetchNutritionSummary = async (date = new Date()) => {
    const dateKey = toLocalDateKey(date);
    return apiRequest(`/food-logs/summary-analytics?date=${encodeURIComponent(dateKey)}`);
};

export const syncFoodLogs = async (email = '') => {
    const response = await apiRequest('/food-logs/log-food');
    const logs = (response.data || []).map((log) => normalizeFoodLogForStorage({ ...log, serverId: log.id }));
    saveFoodLogs(email, logs);
    return logs;
};

export const deleteFoodLog = async (foodId) => {
    return apiRequest(`/food-logs/log-food/${foodId}`, {
        method: 'DELETE'
    });
};
