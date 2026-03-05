import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const getProjectDashboard = async (projectId: number) => {
    const res = await axios.get(`${API_URL}/projects/${projectId}/dashboard-data`);
    return res.data;
};

export const simulateWhatIf = async (data: any) => {
    const res = await axios.post(`${API_URL}/predictor/simulate`, data);
    return res.data;
};

export const chatWithAI = async (text: string) => {
    const res = await axios.post(`${API_URL}/chatbot/query`, { text });
    return res.data;
};
