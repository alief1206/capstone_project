import { apiRequest } from './api';

export const fetchCurrentUser = async () => {
    const response = await apiRequest('/users/me');
    return response.data;
};

export const updatePhysicalProfile = async (profile) => {
    const response = await apiRequest('/users/physical-update', {
        method: 'PUT',
        body: profile
    });

    return response.data;
};

export const createWeightLog = async ({ weight, logDate }) => {
    const response = await apiRequest('/users/weight-logs', {
        method: 'POST',
        body: { weight, logDate }
    });

    return response.data;
};

export const fetchWeightTrend = async (range = 'weekly') => {
    return apiRequest(`/users/weight-logs?range=${encodeURIComponent(range)}`);
};
