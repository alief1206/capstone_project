import { apiRequest } from './api';
import { mergeFoodLogs, normalizeFoodLogForStorage, saveFoodLogs } from '../utils/foodLogStorage';

export const fetchFoodLogs = async (email = '') => {
    const response = await apiRequest('/food-logs/log-food');
    const logs = (response.data || []).map(normalizeFoodLogForStorage);
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
        data: normalizeFoodLogForStorage(response.data)
    };
};

export const syncFoodLogs = async (email = '') => {
    const response = await apiRequest('/food-logs/log-food');
    const logs = (response.data || []).map(normalizeFoodLogForStorage);
    const merged = mergeFoodLogs(email, logs);
    return merged;
};
