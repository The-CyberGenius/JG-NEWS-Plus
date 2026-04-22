import axios from 'axios';

// Get base URL for backend APIs (auto-switches for Vercel Production)
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5001/api' : '/api');

// Create a configured axios instance
export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Storage Keys (for session only now) ──────────────────────────────────────
const KEYS = {
    ADMIN: 'jgnews_admin_session',
};

// ─── Articles CRUD ────────────────────────────────────────────────────────────
export const getArticles = async () => {
    try {
        const response = await api.get('/articles');
        // Map _id from MongoDB back to id for frontend compatibility
        return response.data.map(article => ({ ...article, id: article._id }));
    } catch (error) {
        console.error("Error fetching articles", error);
        return [];
    }
};

export const addArticle = async (article) => {
    try {
        const response = await api.post('/articles', article);
        return { ...response.data, id: response.data._id };
    } catch (error) {
        console.error("Error adding article", error);
        throw error;
    }
};

export const updateArticle = async (id, updates) => {
    try {
        const response = await api.put(`/articles/${id}`, updates);
        return { ...response.data, id: response.data._id };
    } catch (error) {
        console.error("Error updating article", error);
        throw error;
    }
};

export const deleteArticle = async (id) => {
    try {
        await api.delete(`/articles/${id}`);
    } catch (error) {
        console.error("Error deleting article", error);
        throw error;
    }
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const getCategories = async () => {
    try {
        const response = await api.get('/categories');
        return response.data;
    } catch (error) {
        console.error("Error fetching categories", error);
        return [];
    }
};

export const addCategory = async (name) => {
    try {
        await api.post('/categories', { name });
    } catch (error) {
        console.error("Error adding category", error);
        throw error;
    }
};

export const deleteCategory = async (name) => {
    try {
        await api.delete(`/categories/${name}`);
    } catch (error) {
        console.error("Error deleting category", error);
        throw error;
    }
};

// ─── Settings ─────────────────────────────────────────────────────────────────
export const getSettings = async () => {
    try {
        const response = await api.get('/settings');
        return response.data;
    } catch (error) {
        console.error("Error fetching settings", error);
        return {};
    }
};

export const updateSettings = async (updates) => {
    try {
        const response = await api.put('/settings', updates);
        return response.data;
    } catch (error) {
        console.error("Error updating settings", error);
        throw error;
    }
};

// ─── Admin Auth ───────────────────────────────────────────────────────────────
export const adminLogin = async (password) => {
    try {
        const response = await api.post('/admin/login', { password });
        if (response.data.success) {
            sessionStorage.setItem(KEYS.ADMIN, 'true');
            return true;
        }
        return false;
    } catch (error) {
        console.error("Admin login error", error);
        return false;
    }
};

export const adminLogout = () => {
    sessionStorage.removeItem(KEYS.ADMIN);
};

export const isAdminLoggedIn = () =>
    sessionStorage.getItem(KEYS.ADMIN) === 'true';

// ─── E-Newspaper ──────────────────────────────────────────────────────────────
export const getNewspapers = async () => {
    try {
        const response = await api.get('/newspapers');
        return response.data.map(n => ({ ...n, id: n._id }));
    } catch (error) {
        console.error('Error fetching newspapers', error);
        return [];
    }
};

export const addNewspaper = async (data) => {
    try {
        const response = await api.post('/newspapers', data);
        return { ...response.data, id: response.data._id };
    } catch (error) {
        console.error('Error adding newspaper', error);
        throw error;
    }
};

export const deleteNewspaper = async (id) => {
    try {
        await api.delete(`/newspapers/${id}`);
    } catch (error) {
        console.error('Error deleting newspaper', error);
        throw error;
    }
};

// ─── Direct Cloudinary Upload (Frontend → Cloudinary Directly) ────────────────
// No backend needed, no size limit, works on Vercel too
// Requires "jgnews_pdf" unsigned upload preset in Cloudinary Dashboard

const CLOUDINARY_CLOUD = 'dsczo1zim';
const UPLOAD_PRESET = 'jgnews_pdf';

export const uploadPDF = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'jgnews_epaper');

    const { data } = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/raw/upload`,
        formData,
        {
            onUploadProgress: (evt) => {
                if (onProgress && evt.total) {
                    onProgress(Math.round((evt.loaded * 100) / evt.total));
                }
            },
        }
    );
    return { url: data.secure_url, publicId: data.public_id, bytes: data.bytes };
};

export const uploadImage = async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'jgnews_thumbnails');

    const { data } = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        formData,
        {
            onUploadProgress: (evt) => {
                if (onProgress && evt.total) {
                    onProgress(Math.round((evt.loaded * 100) / evt.total));
                }
            },
        }
    );
    return { url: data.secure_url, publicId: data.public_id };
};
// ─── News Sync (RSS) ────────────────────────────────────────────────────────
export const syncNews = async (category = 'india') => {
    try {
        const response = await api.get(`/news-sync/sync?category=${category}`);
        return response.data;
    } catch (error) {
        console.error("Error syncing news", error);
        return [];
    }
};
