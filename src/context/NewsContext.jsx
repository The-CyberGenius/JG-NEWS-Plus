import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    getArticles, getCategories, getSettings,
    addArticle, updateArticle, deleteArticle,
    addCategory, deleteCategory, updateSettings,
    adminLogin, adminLogout, isAdminLoggedIn,
} from '../store/newsStore';

const NewsContext = createContext(null);

export const NewsProvider = ({ children }) => {
    const [articles, setArticles] = useState(() => getArticles());
    const [categories, setCategories] = useState(() => getCategories());
    const [settings, setSettings] = useState(() => getSettings());
    const [adminAuth, setAdminAuth] = useState(() => isAdminLoggedIn());

    const refresh = useCallback(() => {
        setArticles(getArticles());
        setCategories(getCategories());
        setSettings(getSettings());
    }, []);

    const handleAdd = useCallback((article) => {
        addArticle(article);
        setArticles(getArticles());
    }, []);

    const handleUpdate = useCallback((id, updates) => {
        updateArticle(id, updates);
        setArticles(getArticles());
    }, []);

    const handleDelete = useCallback((id) => {
        deleteArticle(id);
        setArticles(getArticles());
    }, []);

    const handleAddCategory = useCallback((name) => {
        addCategory(name);
        setCategories(getCategories());
    }, []);

    const handleDeleteCategory = useCallback((name) => {
        deleteCategory(name);
        setCategories(getCategories());
    }, []);

    const handleUpdateSettings = useCallback((updates) => {
        const s = updateSettings(updates);
        setSettings(s);
    }, []);

    const handleLogin = useCallback((password) => {
        const ok = adminLogin(password);
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
