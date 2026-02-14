import axios from 'axios';
import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE,
});

// Add auth token to every request
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

export const analyzeResume = async (resumeFile, jobDescription) => {
    console.log(`Sending analysis request to: ${API_BASE}/api/analyze`);
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('job_description', jobDescription);

    // Let axios handle Content-Type for FormData
    const response = await api.post('/api/analyze', formData);
    return response.data;
};

export const applyKeywords = async (resumeHtml, keywords) => {
    const response = await api.post('/api/apply-keywords', {
        resume_html: resumeHtml,
        keywords,
    });
    return response.data;
};

export const exportPdf = async (htmlContent, filename = 'resume') => {
    const response = await api.post('/api/export/pdf', {
        html_content: htmlContent,
        filename,
    }, { responseType: 'blob' });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

export const exportDocx = async (htmlContent, filename = 'resume') => {
    const response = await api.post('/api/export/docx', {
        html_content: htmlContent,
        filename,
    }, { responseType: 'blob' });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.docx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

export const getHistory = async () => {
    const response = await api.get('/api/history');
    return response.data;
};

export const saveHistory = async (entry) => {
    const response = await api.post('/api/history', entry);
    return response.data;
};

export const getHistoryItem = async (id) => {
    const response = await api.get(`/api/history/${id}`);
    return response.data;
};

export const deleteHistoryItem = async (id) => {
    const response = await api.delete(`/api/history/${id}`);
    return response.data;
};

export default api;
