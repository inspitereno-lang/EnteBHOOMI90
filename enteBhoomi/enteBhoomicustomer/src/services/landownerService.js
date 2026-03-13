import api from '../api/axios';

export const submitLandownerEnquiryApi = async (formData) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
        };

        const response = await api.post('/landowner/enquiry', formData, config);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw error.response.data;
        }
        throw new Error('Failed to submit landowner enquiry');
    }
};
