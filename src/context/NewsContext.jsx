import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
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
    const fetchedRef = useRef(false);

    const refresh = useCallback(async ({ force = false } = {}) => {
        // Prevent duplicate initial fetches
        if (fetchedRef.current && !force) return;
        fetchedRef.current = true;

        setIsLoading(true);
        try {
            // For public site: load first 30 articles (summary fields only - no heavy content)
            // This makes initial load MUCH faster
            const [articlesResult, fetchedCategories, fetchedSettings] = await Promise.all([
                getArticles({ page: 1, limit: 30, fields: 'summary' }),
                getCategories(),
                getSettings(),
            ]);

            // Handle paginated response
            const articleList = articlesResult.articles || articlesResult;
            setArticles(articleList);
            setCategories(fetchedCategories);
            setSettings(fetchedSettings);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Full refresh for admin (loads all articles with content)
    const refreshAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fetchedArticles, fetchedCategories, fetchedSettings] = await Promise.all([
                getArticles(), // No pagination = all articles
                getCategories(),
                getSettings(),
            ]);
            const articleList = Array.isArray(fetchedArticles) ? fetchedArticles : (fetchedArticles.articles || []);
            setArticles(articleList);
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
        await refreshAll();
    }, [refreshAll]);

    const handleUpdate = useCallback(async (id, updates) => {
        await updateArticle(id, updates);
        await refreshAll();
    }, [refreshAll]);

    const handleDelete = useCallback(async (id) => {
        await deleteArticle(id);
        await refreshAll();
    }, [refreshAll]);

    const handleAddCategory = useCallback(async (name) => {
        await addCategory(name);
        await refreshAll();
    }, [refreshAll]);

    const handleDeleteCategory = useCallback(async (name) => {
        await deleteCategory(name);
        await refreshAll();
    }, [refreshAll]);

    const handleUpdateSettings = useCallback(async (updates) => {
        const s = await updateSettings(updates);
        if (s) setSettings(s);
    }, []);

    const handleLogin = useCallback(async (password) => {
        const ok = await adminLogin(password);
        if (ok) {
            setAdminAuth(true);
            // Load all articles for admin after login
            await refreshAll();
        }
        return ok;
    }, [refreshAll]);

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
            refresh: refreshAll,
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
