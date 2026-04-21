import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    getArticles, getCategories, getSettings,
    addArticle, updateArticle, deleteArticle,
    addCategory, deleteCategory, updateSettings,
    adminLogin, adminLogout, isAdminLoggedIn,
} from '../store/newsStore';

const NewsContext = createContext(null);

export const NewsProvider = ({ children }) => {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [adminAuth, setAdminAuth] = useState(() => isAdminLoggedIn());

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedArticles = await getArticles();
            const fetchedCategories = await getCategories();
            const fetchedSettings = await getSettings();
            setArticles(fetchedArticles);
            setCategories(fetchedCategories);
            setSettings(fetchedSettings);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        refresh();
    }, [refresh]);

    const handleAdd = useCallback(async (article) => {
        await addArticle(article);
        await refresh();
    }, [refresh]);

    const handleUpdate = useCallback(async (id, updates) => {
        await updateArticle(id, updates);
        await refresh();
    }, [refresh]);

    const handleDelete = useCallback(async (id) => {
        await deleteArticle(id);
        await refresh();
    }, [refresh]);

    const handleAddCategory = useCallback(async (name) => {
        await addCategory(name);
        await refresh();
    }, [refresh]);

    const handleDeleteCategory = useCallback(async (name) => {
        await deleteCategory(name);
        await refresh();
    }, [refresh]);

    const handleUpdateSettings = useCallback(async (updates) => {
        const s = await updateSettings(updates);
        if (s) setSettings(s);
    }, []);

    const handleLogin = useCallback(async (password) => {
        const ok = await adminLogin(password);
        if (ok) setAdminAuth(true);
        return ok;
    }, []);

    const handleLogout = useCallback(() => {
        adminLogout();
        setAdminAuth(false);
    }, []);

    return (
        <NewsContext.Provider value={{
            articles,
            categories,
            settings,
            adminAuth,
            isLoading,
            refresh,
            addArticle: handleAdd,
            updateArticle: handleUpdate,
            deleteArticle: handleDelete,
            addCategory: handleAddCategory,
            deleteCategory: handleDeleteCategory,
            updateSettings: handleUpdateSettings,
            login: handleLogin,
            logout: handleLogout,
        }}>
            {children}
        </NewsContext.Provider>
    );
};

export const useNews = () => {
    const ctx = useContext(NewsContext);
    if (!ctx) throw new Error('useNews must be used within NewsProvider');
    return ctx;
};
