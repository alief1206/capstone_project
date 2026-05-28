import { apiRequest } from './api';

export const fetchFoodCatalog = async ({ query = '', goal = 'jaga', limit = 20, recommendationLimit = 24 } = {}) => {
    const params = new URLSearchParams({
        q: query,
        goal,
        limit: String(limit),
        recommendationLimit: String(recommendationLimit)
    });

    const response = await apiRequest(`/foods?${params.toString()}`);
    return response.data;
};
