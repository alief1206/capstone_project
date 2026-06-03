import { apiRequest } from './api';

export const askNutritionAssistant = async (message, context = null) => {
    const response = await apiRequest('/ai/chat', {
        method: 'POST',
        body: { message, context, sourceAction: context?.sourceAction }
    });

    return response.data?.reply || 'Maaf, saya belum bisa menjawab pertanyaan itu.';
};
