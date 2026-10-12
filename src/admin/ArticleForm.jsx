import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { uploadImage } from '../store/newsStore';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RAJASTHAN_DISTRICTS = [
    'अजमेर', 'अलवर', 'अनूपगढ़', 'बालोतरा', 'बांसवाड़ा', 'बारां', 'बाड़मेर', 'ब्यावर', 'भरतपुर', 'भीलवाड़ा', 'बीकानेर', 'बूंदी', 'चित्तौड़गढ़', 'चूरू', 'दौसा', 'डीग', 'धौलपुर', 'डीडवाना-कुचामन', 'दूदू', 'डूंगरपुर', 'गंगानगर', 'गंगापुर सिटी', 'हनुमानगढ़', 'जयपुर', 'जयपुर ग्रामीण', 'जैसलमेर', 'जालौर', 'झालावाड़', 'झुंझुनूं', 'जोधपुर', 'जोधपुर ग्रामीण', 'करौली', 'केकड़ी', 'खैरथल-तिजारा', 'कोटा', 'कोटपुतली-बहरोड़', 'नागौर', 'नीम का थाना', 'पाली', 'फलोदी', 'प्रतापगढ़', 'राजसमंद', 'सलुंबर', 'सांचौर', 'सवाई माधोपुर', 'शाहpura', 'सीकर', 'सिरोही', 'टोंक', 'उदयपुर', 'अन्य'
];

const DEFAULT_NEWS_IMAGE = 'https://res.cloudinary.com/dsczo1zim/image/upload/v1791826657/jgnews_defaults/default_news_logo.png';
const DRAFT_KEY = 'jgnews_news_draft';

const EMPTY_FORM = {
    title: '',
    excerpt: '',
    content: '',
    category: 'राजस्थान',
    district: 'चूरू',
    localArea: 'रतनगढ़',
    image: '',
    videoUrl: '',
    author: 'मनोज पारीक',
    tags: '',
    isBreaking: false,
    isFeatured: false,
    date: '',
};

const toLocalInput = (d) => {
    if (!d) return '';
    try {
        const dt = new Date(d);
        const tz = dt.getTimezoneOffset() * 60000;
        return new Date(dt - tz).toISOString().slice(0, 16);
    } catch { return ''; }
};

const nowLocalInput = () => toLocalInput(new Date());

export default function ArticleForm() {
    const { id } = useParams();
    const location = useLocation();
    const { articles, categories, addArticle, updateArticle, login } = useNews();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const quillRef = useRef(null);
    const aiPrefill = location.state?.prefill || null;
    const fromAiSync = !!aiPrefill;

    const [form, setForm] = useState({ ...EMPTY_FORM, date: nowLocalInput() });
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [imgPreview, setImgPreview] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [draftRestored, setDraftRestored] = useState(false);
    const [showReAuthModal, setShowReAuthModal] = useState(false);
    const [reAuthPassword, setReAuthPassword] = useState('');
    const [reAuthError, setReAuthError] = useState('');
    const [reAuthSubmitting, setReAuthSubmitting] = useState(false);

    // --- Optimized Image Handler for Editor ---
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                setToast('⏳ फोटो अपलोड हो रही है...');
                try {
                    const res = await uploadImage(file);
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection();
                    quill.insertEmbed(range.index, 'image', res.url);
                    setToast('✅ फोटो आर्टिकल में लग गई!');
                } catch (err) {
                    setToast('❌ अपलोड विफल');
                }
            }
        };
    };

    // UseMemo to prevent unnecessary re-renders of modules
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        },
    }), []);

    useEffect(() => {
        if (isEdit && id) {
            const art = articles.find(a => a.id === id);
            if (art) {
                setForm({
                    title: art.title || '',
                    excerpt: art.excerpt || '',
                    content: art.content || '',
                    category: art.category || '',
                    district: art.district || '',
                    localArea: art.localArea || '',
                    image: art.image || '',
                    videoUrl: art.videoUrl || '',
                    author: art.author || '',
                    tags: (art.tags || []).join(', '),
                    isBreaking: art.isBreaking || false,
                    isFeatured: art.isFeatured || false,
                    date: toLocalInput(art.date) || '',
                });
                setImgPreview(art.image || '');
            }
        } else if (!isEdit && aiPrefill) {
            // AI Sync prefilled data — load it into form
            setForm({
                title: aiPrefill.title || '',
                excerpt: aiPrefill.excerpt || '',
                content: aiPrefill.content || '',
                category: aiPrefill.category || '',
                district: aiPrefill.district || '',
                localArea: aiPrefill.localArea || '',
                image: aiPrefill.image || '',
                videoUrl: aiPrefill.videoUrl || '',
                author: aiPrefill.author || '',
                tags: aiPrefill.tags || '',
                isBreaking: aiPrefill.isBreaking || false,
                isFeatured: aiPrefill.isFeatured || false,
                date: nowLocalInput(),
            });
        } else if (!isEdit && !aiPrefill) {
            // Restore draft if available
            try {
                const saved = localStorage.getItem(DRAFT_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed && (parsed.title || parsed.content)) {
                        setForm(parsed);
                        if (parsed.image) setImgPreview(parsed.image);
                        setDraftRestored(true);
                    }
                }
            } catch (e) {
                console.error('Failed to restore draft', e);
            }
        }
    }, [id, isEdit, articles, aiPrefill]);

    // Auto-save draft on changes (only in add mode)
    useEffect(() => {
        if (!isEdit && !fromAiSync && (form.title?.trim() || form.content?.trim())) {
            const timer = setTimeout(() => {
                try {
                    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
                } catch {}
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [form, isEdit, fromAiSync]);

    const clearDraft = () => {
        try {
            localStorage.removeItem(DRAFT_KEY);
        } catch {}
        setForm({ ...EMPTY_FORM, date: nowLocalInput() });
        setImgPreview('');
        setImageFile(null);
        setDraftRestored(false);
        setToast('🗑️ ड्राफ्ट साफ़ कर दिया गया');
    };

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleImgChange = (e) => {
        const val = e.target.value;
        set('image', val);
        setImgPreview(val);
    };

    const handleImgFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImgPreview(URL.createObjectURL(file));
    };

    const executeSubmit = async () => {
        setSaving(true);
        let finalImageUrl = (form.image || '').trim();

        try {
            if (imageFile) {
                setToast('⏳ मुख्य फोटो अपलोड हो रही है...');
                const uploadResult = await uploadImage(imageFile);
                finalImageUrl = uploadResult.url;
            } else if (!finalImageUrl) {
                // If user did not upload or provide any image, use official default logo
                finalImageUrl = DEFAULT_NEWS_IMAGE;
            }

            const data = {
                ...form,
                category: form.category || 'राजस्थान',
                district: form.district || 'चूरू',
                localArea: form.localArea || 'रतनगढ़',
                author: form.author || 'मनोज पारीक',
                image: finalImageUrl,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                // If a date was set, use it; otherwise let backend use default (now)
                ...(form.date ? { date: new Date(form.date).toISOString() } : {}),
            };

            if (isEdit) {
                await updateArticle(id, data);
                setToast('✅ खबर अपडेट हो गई!');
            } else {
                await addArticle(data);
                try {
                    localStorage.removeItem(DRAFT_KEY);
                } catch {}
                setToast('✅ खबर सफलतापूर्वक जोड़ी गई!');
            }
            setTimeout(() => {
                setToast('');
                navigate('/admin/news');
            }, 1500);
        } catch (error) {
            console.error('Failed to save article:', error);
            if (error.response?.status === 401) {
                setShowReAuthModal(true);
                setReAuthError('सत्र समाप्त हो गया है। कृपया पासवर्ड डालें — आपका लिखा हुआ आर्टिकल सुरक्षित है!');
            } else {
                setToast('❌ विफल: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        if (!form.title.trim()) return setToast('❌ शीर्षक (Title) ज़रुरी है');
        if (!form.category) return setToast('❌ श्रेणी (Category) चुनें');
        if (!form.content.trim()) return setToast('❌ खबर विस्तार (Content) ज़रुरी है');

        await executeSubmit();
    };

    const handleReAuthSubmit = async (e) => {
        e.preventDefault();
        if (!reAuthPassword.trim()) return;
        setReAuthSubmitting(true);
        setReAuthError('');

        try {
            const ok = await login(reAuthPassword.trim());
            if (ok) {
                setShowReAuthModal(false);
                setReAuthPassword('');
                setToast('✅ लॉगिन सफल! खबर तुरंत पोस्ट की जा रही है...');
                await executeSubmit();
            } else {
                setReAuthError('गलत पासवर्ड! कृपया पुनः प्रयास करें।');
            }
        } catch (err) {
            setReAuthError('लॉगिन विफल: ' + (err.response?.data?.message || err.message));
        } finally {
            setReAuthSubmitting(false);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-in-out', paddingBottom: '50px' }}>
            {toast && <div className="toast" style={{
                zIndex: 10000, background: 'var(--navy)', color: 'var(--teal)', fontWeight: 700,
                position: 'fixed', bottom: '20px', right: '20px',
                padding: '10px 16px', borderRadius: '8px',
                fontSize: '0.85rem', maxWidth: '320px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                animation: 'fadeIn 0.2s ease',
            }}>{toast}</div>}

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <Link to="/admin/news" style={{
                    width: '40px', height: '40px', borderRadius: '12px', background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontSize: '1.2rem'
                }}>←</Link>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy)', margin: 0 }}>
                        {isEdit ? '✏️ खबर संपादित करें' : (fromAiSync ? '🤖 AI Sync Article — Edit & Publish' : '➕ नई खबर जोड़ें')}
                    </h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>
                        Optimized Cloudinary uploads के साथ मीडिया मैनेज करें
                    </p>
                </div>
            </div>

            {draftRestored && !isEdit && (
                <div style={{
                    background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46',
                    padding: '12px 18px', borderRadius: '14px', marginBottom: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', fontWeight: 700 }}>
                        <span style={{ fontSize: '1.2rem' }}>💾</span>
                        <span>आपका पिछला सुरक्षित ड्राफ्ट ऑटो-रीस्टोर कर लिया गया है।</span>
                    </div>
                    <button
                        type="button"
                        onClick={clearDraft}
                        style={{
                            background: 'white', border: '1px solid #6ee7b7', color: '#065f46',
                            padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                            fontWeight: 700, fontSize: '0.8rem'
                        }}
                    >
                        ड्राफ्ट साफ़ करें (Reset)
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="article-form-grid">

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid var(--gray-100)' }}>
                            <h3 style={{ fontWeight: 900, color: 'var(--navy)', marginBottom: '24px', fontSize: '1.1rem' }}>
                                📝 मुख्य सामग्री
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '8px', textTransform: 'uppercase' }}>शीर्षक (Title) *</label>
                                    <input
                                        className="form-control"
                                        value={form.title}
                                        onChange={e => set('title', e.target.value)}
                                        placeholder="आकर्षक शीर्षक लिखें..."
                                        required
                                        style={{ fontSize: '1.1rem', fontWeight: 700, padding: '16px', borderRadius: '14px' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '8px', textTransform: 'uppercase' }}>सारांश (Excerpt)</label>
                                    <textarea
                                        className="form-control"
                                        value={form.excerpt}
                                        onChange={e => set('excerpt', e.target.value)}
                                        placeholder="खबर का छोटा सारांश..."
                                        style={{ minHeight: '80px', padding: '16px', borderRadius: '14px' }}
                                    />
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '8px', textTransform: 'uppercase' }}>पूर्ण खबर (Content) *</label>
                                    <div className="editor-container" style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column' }}>
                                        <ReactQuill
                                            ref={quillRef}
                                            theme="snow"
                                            value={form.content}
                                            onChange={val => set('content', val)}
                                            modules={modules}
                                        />
                                    </div>
                                    <p style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>
                                        💡 Tip: एडिटर के बीच में फोटो डालने पर वो Cloudinary पर ऑटो-अपलोड होगी।
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Media Section */}
                        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid var(--gray-100)' }}>
                            <h3 style={{ fontWeight: 900, color: 'var(--navy)', marginBottom: '24px', fontSize: '1.1rem' }}>🖼️ मुख्य मीडिया (Hero)</h3>
                            <div className="hero-media-grid">
                                <div>
                                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '8px', textTransform: 'uppercase' }}>मुख्य फोटो</label>
                                    <div style={{
                                        border: '2px dashed var(--gray-200)', borderRadius: '18px', padding: '20px',
                                        textAlign: 'center', background: 'var(--gray-50)', position: 'relative',
                                        minHeight: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {imgPreview ? (
                                            <>
                                                <img src={imgPreview} alt="Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '12px' }} />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        setImgPreview('');
                                                        setImageFile(null);
                                                        set('image', '');
                                                    }}
                                                    title="फोटो हटाएं"
                                                    style={{
                                                        position: 'absolute', top: '10px', right: '10px',
                                                        zIndex: 5, width: '32px', height: '32px',
                                                        borderRadius: '50%', border: 'none',
                                                        background: 'rgba(229, 57, 53, 0.95)', color: 'white',
                                                        cursor: 'pointer', fontSize: '1rem', fontWeight: 800,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                                                        transition: 'transform 0.15s',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                                >✕</button>
                                            </>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '10px' }}>
                                                <img
                                                    src={DEFAULT_NEWS_IMAGE}
                                                    alt="Default JG News Logo"
                                                    style={{ width: '130px', maxHeight: '100px', objectFit: 'contain', borderRadius: '10px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.12))' }}
                                                />
                                                <div style={{ fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 800 }}>
                                                    डिफ़ॉल्ट लोगो सेट है
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', fontWeight: 600 }}>
                                                    (फोटो न डालने पर यही उपयोग होगा — बदलने के लिए यहाँ क्लिक करें)
                                                </div>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleImgFile} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: imgPreview ? 1 : 2 }} />
                                    </div>
                                    <input className="form-control" value={form.image} onChange={handleImgChange} placeholder="या URL डालें..." style={{ marginTop: '10px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '8px', textTransform: 'uppercase' }}>YouTube Link (Top)</label>
                                    <input className="form-control" value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid var(--gray-100)' }}>
                            <h3 style={{ fontWeight: 900, color: 'var(--navy)', marginBottom: '20px', fontSize: '1rem' }}>📌 वर्गीकरण</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)} required>
                                    <option value="">-- श्रेणी --</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <div>
                                    <label style={{ fontSize: '0.78rem', color: 'var(--gray-600)', fontWeight: 700, marginBottom: '4px', display: 'block' }}>ज़िला (District) *</label>
                                    <select
                                        className="form-control"
                                        value={form.district}
                                        onChange={e => set('district', e.target.value)}
                                        required
                                    >
                                        <option value="">-- ज़िला चुनें --</option>
                                        {RAJASTHAN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.78rem', color: 'var(--gray-600)', fontWeight: 700, marginBottom: '4px', display: 'block' }}>शहर / तहसील (Local Area)</label>
                                    <input
                                        className="form-control"
                                        value={form.localArea}
                                        onChange={e => set('localArea', e.target.value)}
                                        placeholder="वैकल्पिक (Optional)..."
                                        autoComplete="off"
                                    />
                                </div>
                                <input className="form-control" value={form.author} onChange={e => set('author', e.target.value)} placeholder="लेखक का नाम" />
                                <div>
                                    <label style={{ fontSize: '0.78rem', color: 'var(--gray-600)', fontWeight: 700, marginBottom: '4px', display: 'block' }}>
                                        📅 अपलोड तारीख {!isEdit && <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>(खाली = अभी)</span>}
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        value={form.date}
                                        onChange={e => set('date', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Publishing Options */}
                        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid var(--gray-100)' }}>
                            <h3 style={{ fontWeight: 900, color: 'var(--navy)', marginBottom: '8px', fontSize: '1rem' }}>🚀 प्रकाशन विकल्प</h3>
                            <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '18px' }}>
                                यहाँ से तय करें खबर वेबसाइट पर कहाँ-कहाँ दिखेगी
                            </p>

                            <label style={{
                                display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px',
                                background: form.isBreaking ? 'rgba(220,38,38,0.08)' : 'var(--gray-50)',
                                borderRadius: '14px', marginBottom: '12px', cursor: 'pointer',
                                border: `2px solid ${form.isBreaking ? '#dc2626' : 'transparent'}`,
                                transition: 'all 0.2s'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={form.isBreaking}
                                    onChange={e => set('isBreaking', e.target.checked)}
                                    style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#dc2626', cursor: 'pointer' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.92rem' }}>
                                        🔴 ब्रेकिंग न्यूज (Breaking)
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '3px' }}>
                                        ऊपर वाले लाल टिकर में चलेगी
                                    </div>
                                </div>
                            </label>

                            <label style={{
                                display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px',
                                background: form.isFeatured ? 'rgba(245,158,11,0.1)' : 'var(--gray-50)',
                                borderRadius: '14px', marginBottom: '12px', cursor: 'pointer',
                                border: `2px solid ${form.isFeatured ? '#f59e0b' : 'transparent'}`,
                                transition: 'all 0.2s'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={form.isFeatured}
                                    onChange={e => set('isFeatured', e.target.checked)}
                                    style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: '#f59e0b', cursor: 'pointer' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, color: '#b45309', fontSize: '0.92rem' }}>
                                        ⭐ फीचर्ड / स्लाइड (Featured)
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '3px' }}>
                                        होमपेज के मुख्य स्लाइडर में दिखेगी
                                    </div>
                                </div>
                            </label>

                            <div style={{ marginTop: '16px' }}>
                                <label style={{ display: 'block', fontWeight: 800, fontSize: '0.72rem', color: 'var(--gray-500)', marginBottom: '6px', textTransform: 'uppercase' }}>
                                    Tags (कीवर्ड्स)
                                </label>
                                <input
                                    className="form-control"
                                    value={form.tags}
                                    onChange={e => set('tags', e.target.value)}
                                    placeholder="जयपुर, राजनीति, मौसम"
                                    style={{ fontSize: '0.88rem' }}
                                />
                                <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: '5px' }}>
                                    कॉमा से अलग करें
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ padding: '18px', width: '100%', borderRadius: '16px' }} disabled={saving}>
                            {saving ? '⏳ सुरक्षित हो रहा है...' : isEdit ? '✅ अपडेट करें' : '🚀 प्रकाशित करें'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Seamless In-Page Re-Auth Modal (Prevents text loss if session dropped) */}
            {showReAuthModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(6px)', zIndex: 99999,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '24px', padding: '36px', maxWidth: '420px', width: '100%',
                        boxShadow: '0 25px 70px rgba(0,0,0,0.35)', textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '2.6rem', marginBottom: '12px' }}>🔐</div>
                        <h3 style={{ margin: '0 0 8px', color: 'var(--navy)', fontWeight: 900, fontSize: '1.35rem' }}>
                            लॉगिन सत्र समाप्त हुआ
                        </h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.5 }}>
                            चिंता न करें! <strong>आपका लिखा हुआ आर्टिकल 100% सुरक्षित है।</strong> बस पासवर्ड डालकर तुरंत पोस्ट करें:
                        </p>
                        {reAuthError && (
                            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px 14px', borderRadius: '12px', fontSize: '0.82rem', marginBottom: '16px', fontWeight: 700 }}>
                                {reAuthError}
                            </div>
                        )}
                        <form onSubmit={handleReAuthSubmit}>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="एडमिन या सबएडमिन पासवर्ड..."
                                value={reAuthPassword}
                                onChange={e => setReAuthPassword(e.target.value)}
                                autoFocus
                                required
                                style={{ padding: '14px 16px', fontSize: '1rem', borderRadius: '14px', marginBottom: '16px', border: '2px solid var(--gray-200)' }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowReAuthModal(false)}
                                    className="btn"
                                    style={{ flex: 1, background: 'var(--gray-100)', color: 'var(--gray-700)', padding: '12px', borderRadius: '12px', fontWeight: 700 }}
                                >
                                    रद्द करें
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={reAuthSubmitting}
                                    style={{ flex: 2, padding: '12px', borderRadius: '12px', fontWeight: 800 }}
                                >
                                    {reAuthSubmitting ? 'जाँच हो रही है...' : 'लॉगिन और पोस्ट करें 🚀'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .article-form-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 24px;
                    align-items: start;
                }
                .hero-media-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                @media (min-width: 1024px) {
                    .article-form-grid {
                        grid-template-columns: 2fr 1fr;
                        gap: 32px;
                    }
                    .hero-media-grid {
                        grid-template-columns: 1fr 1fr;
                        gap: 24px;
                    }
                }
                .editor-container .ql-toolbar.ql-snow {
                    border-top-left-radius: 14px;
                    border-top-right-radius: 14px;
                    background: #f8fafc;
                    padding: 12px;
                    border: none;
                    border-bottom: 1px solid var(--gray-200);
                    position: sticky;
                    top: 0;
                    z-index: 5;
                }
                .editor-container .ql-container.ql-snow {
                    border-bottom-left-radius: 14px;
                    border-bottom-right-radius: 14px;
                    border: none;
                    height: auto;
                }
                .editor-container .ql-editor {
                    min-height: 500px;
                    max-height: 70vh;
                    overflow-y: auto;
                    font-size: 1.05rem;
                    line-height: 1.7;
                    color: #334155;
                    padding: 18px 20px 60px;
                }
                .editor-container .ql-editor img {
                    max-width: 100%;
                    border-radius: 12px;
                    margin: 15px 0;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                .editor-container .ql-editor p:last-child {
                    margin-bottom: 40px;
                }
            `}</style>
        </div>
    );
}
