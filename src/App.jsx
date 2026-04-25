import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { NewsProvider } from './context/NewsContext';
import { LangProvider } from './context/LangContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Lazy loading pages and admin components
const Home = lazy(() => import('./pages/Home'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const VideoGallery = lazy(() => import('./pages/VideoGallery'));
const PhotoGallery = lazy(() => import('./pages/PhotoGallery'));
const LiveTV = lazy(() => import('./pages/LiveTV'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const EPaper = lazy(() => import('./pages/EPaper'));

const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const Dashboard = lazy(() => import('./admin/Dashboard'));
const NewsManager = lazy(() => import('./admin/NewsManager'));
const ArticleForm = lazy(() => import('./admin/ArticleForm'));
const LiveTVManager = lazy(() => import('./admin/LiveTVManager'));
const CategoryManager = lazy(() => import('./admin/CategoryManager'));
const NewspaperManager = lazy(() => import('./admin/NewspaperManager'));
const AdminGuard = lazy(() => import('./admin/AdminGuard'));
const NewsSyncManager = lazy(() => import('./admin/NewsSyncManager'));

function PublicLayout({ children }) {
    return (
        <>
            <Header />
            <main style={{ minHeight: '60vh' }}>{children}</main>
            <Footer />
        </>
    );
}

const PageLoader = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
    </div>
);

export default function App() {
    return (
        <LangProvider>
            <NewsProvider>
                <BrowserRouter>
                    <Suspense fallback={<PageLoader />}>
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
                            <Route path="/epaper" element={<PublicLayout><EPaper /></PublicLayout>} />

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
                                            <Route path="epaper" element={<NewspaperManager />} />
                                            <Route path="sync" element={<NewsSyncManager />} />
                                        </Routes>
                                    </AdminLayout>
                                </AdminGuard>
                            } />
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </NewsProvider>
        </LangProvider>
    );
}
