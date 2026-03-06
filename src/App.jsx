import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NewsProvider } from './context/NewsContext';
import { LangProvider } from './context/LangContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ArticlePage from './pages/ArticlePage';
import VideoGallery from './pages/VideoGallery';
import PhotoGallery from './pages/PhotoGallery';
import LiveTV from './pages/LiveTV';
import About from './pages/About';
import Contact from './pages/Contact';
import SearchResults from './pages/SearchResults';
import AdminLayout from './admin/AdminLayout';
import AdminLogin from './admin/AdminLogin';
import Dashboard from './admin/Dashboard';
import NewsManager from './admin/NewsManager';
import ArticleForm from './admin/ArticleForm';
import LiveTVManager from './admin/LiveTVManager';
import CategoryManager from './admin/CategoryManager';
import AdminGuard from './admin/AdminGuard';

function PublicLayout({ children }) {
    return (
        <>
            <Header />
            <main style={{ minHeight: '60vh' }}>{children}</main>
            <Footer />
        </>
    );
}

export default function App() {
    return (
        <LangProvider>
            <NewsProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                        <Route path="/category/:category" element={<PublicLayout><CategoryPage /></PublicLayout>} />
                        <Route path="/article/:id" element={<PublicLayout><ArticlePage /></PublicLayout>} />
                        <Route path="/videos" element={<PublicLayout><VideoGallery /></PublicLayout>} />
                        <Route path="/photos" element={<PublicLayout><PhotoGallery /></PublicLayout>} />
                        <Route path="/live" element={<PublicLayout><LiveTV /></PublicLayout>} />
                        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
                        <Route path="/search" element={<PublicLayout><SearchResults /></PublicLayout>} />

                        {/* Admin */}
                        <Route path="/admin" element={<AdminLogin />} />
                        <Route path="/admin/*" element={
                            <AdminGuard>
                                <AdminLayout>
                                    <Routes>
                                        <Route path="dashboard" element={<Dashboard />} />
                                        <Route path="news" element={<NewsManager />} />
                                        <Route path="news/add" element={<ArticleForm />} />
                                        <Route path="news/edit/:id" element={<ArticleForm />} />
                                        <Route path="live" element={<LiveTVManager />} />
                                        <Route path="categories" element={<CategoryManager />} />
                                    </Routes>
                                </AdminLayout>
                            </AdminGuard>
                        } />
                    </Routes>
                </BrowserRouter>
            </NewsProvider>
        </LangProvider>
    );
}
