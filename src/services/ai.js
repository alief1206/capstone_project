import { apiRequest } from './api';

export const askNutritionAssistant = async (message) => {
    const response = await apiRequest('/ai/chat', {
        method: 'POST',
        body: { message }
    });

    return response.data?.reply || 'Maaf, saya belum bisa menjawab pertanyaan itu.';
};
