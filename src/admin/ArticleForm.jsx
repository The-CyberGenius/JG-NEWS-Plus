import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { uploadImage } from '../store/newsStore';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RAJASTHAN_CITIES = [
    'जयपुर', 'जोधपुर', 'उदयपुर', 'कोटा', 'बीकानेर', 'अजमेर', 'भरतपुर',
    'सीकर', 'टोंक', 'अलवर', 'दौसा', 'पाली', 'बाड़मेर', 'जैसलमेर',
    'नागौर', 'श्रीगंगानगर', 'हनुमानगढ़', 'चूरू', 'झुंझुनू', 'सवाई माधोपुर',
    'धौलपुर', 'करौली', 'बूंदी', 'झालावाड़', 'बारां', 'राजसमंद', 'चित्तौड़गढ़',
    'प्रतापगढ़', 'डूंगरपुर', 'बांसवाड़ा', 'सिरोही', 'जालौर', 'अन्य'
];

const EMPTY_FORM = {
    title: '',
    excerpt: '',
    content: '',
    category: '',
    location: '',
    image: '',
    videoUrl: '',
    author: '',
    tags: '',
    isBreaking: false,
    isFeatured: false,
};

// Quill Modules & Formats
const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image', 'video'],
        ['clean']
    ],
};

export default function ArticleForm() {
    const { id } = useParams();
    const { articles, categories, addArticle, updateArticle } = useNews();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [imgPreview, setImgPreview] = useState('');
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (isEdit && id) {
            const art = articles.find(a => a.id === id);
            if (art) {
                setForm({
                    title: art.title || '',
                    excerpt: art.excerpt || '',
                    content: art.content || '',
                    category: art.category || '',
                    location: art.location || '',
                    image: art.image || '',
                    videoUrl: art.videoUrl || '',
                    author: art.author || '',
                    tags: (art.tags || []).join(', '),
                    isBreaking: art.isBreaking || false,
                    isFeatured: art.isFeatured || false,
                });
                setImgPreview(art.image || '');
            }
        }
    }, [id, isEdit, articles]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!form.title.trim()) return setToast('❌ शीर्षक (Title) ज़रुरी है');
        if (!form.category) return setToast('❌ श्रेणी (Category) चुनें');
        if (!form.content.trim()) return setToast('❌ खबर विस्तार (Content) ज़रुरी है');

        setSaving(true);
        let finalImageUrl = form.image;

        try {
            if (imageFile) {
                setToast('⏳ फोटो अपलोड हो रही है...');
                const uploadResult = await uploadImage(imageFile);
                finalImageUrl = uploadResult.url;
            }

            const data = {
                ...form,
                image: finalImageUrl,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            };

            if (isEdit) {
                await updateArticle(id, data);
                setToast('✅ खबर अपडेट हो गई!');
            } else {
                await addArticle(data);
                setToast('✅ खबर सफलतापूर्वक जोड़ी गई!');
            }
            setTimeout(() => {
                setToast('');
                navigate('/admin/news');
            }, 1500);
        } catch (error) {
            console.error('Failed to save article:', error);
            setToast('❌ विफल: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-in-out', paddingBottom: '50px' }}>
            {toast && <div className="toast" style={{ 
                zIndex: 10000, background: 'var(--navy)', color: 'var(--teal)', fontWeight: 800,
                position: 'fixed', top: '20px', right: '20px', padding: '15px 25px', borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>{toast}</div>}

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <Link to="/admin/news" style={{
                    width: '40px', height: '40px', borderRadius: '12px', background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', fontSize: '1.2rem'
                }}>←</Link>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy)', margin: 0 }}>
                        {isEdit ? '✏️ खबर संपादित करें' : '➕ नई खबर जोड़ें'}
                    </h1>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>
                        Rich Text Editor के साथ खबर में media insert करें
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid var(--gray-100)' }}>
                            <h3 style={{ fontWeight: 900, color: 'var(--navy)', marginBottom: '24px', fontSize: '1.1rem' }}>
                                📝 मुख्य सामग्री (Rich Text)
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
                                    <div className="editor-container" style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                                        <ReactQuill
                                            theme="snow"
                                            value={form.content}
                                            onChange={val => set('content', val)}
                                            modules={modules}
                                            style={{ height: '400px', background: 'white' }}
                                        />
                                    </div>
                                    <p style={{ marginTop: '50px', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                                        💡 Toolbar में 🖼️ icon से फोटो और 🎬 icon से वीडियो लिंक डाल सकते हैं।
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Media Section */}
                        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid var(--gray-100)' }}>
                            <h3 style={{ fontWeight: 900, color: 'var(--navy)', marginBottom: '24px', fontSize: '1.1rem' }}>🖼️ मुख्य मीडिया (Hero)</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.75rem', color: 'var(--gray-500)', marginBottom: '8px', textTransform: 'uppercase' }}>मुख्य फोटो</label>
                                    <div style={{
                                        border: '2px dashed var(--gray-200)', borderRadius: '18px', padding: '20px',
                                        textAlign: 'center', background: 'var(--gray-50)', position: 'relative',
                                        minHeight: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {imgPreview ? (
                                            <img src={imgPreview} alt="Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '12px' }} />
                                        ) : (
                                            <div style={{ fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 700 }}>फोटो चुनें</div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleImgFile} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
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
                                <select className="form-control" value={form.location} onChange={e => set('location', e.target.value)} required>
                                    <option value="">-- शहर --</option>
                                    {RAJASTHAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input className="form-control" value={form.author} onChange={e => set('author', e.target.value)} placeholder="लेखक का नाम" />
                            </div>
                        </div>

                        <div style={{ background: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid var(--gray-100)' }}>
                            <h3 style={{ fontWeight: 900, color: 'var(--navy)', marginBottom: '20px', fontSize: '1rem' }}>⚙️ विकल्प</h3>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px' }}>
                                <input type="checkbox" checked={form.isBreaking} onChange={e => set('isBreaking', e.target.checked)} />
                                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>🔴 ब्रेकिंग न्यूज़</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} />
                                <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>⭐ फीचर्ड खबर</span>
                            </label>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ padding: '18px', width: '100%', borderRadius: '16px' }} disabled={saving}>
                            {saving ? '⏳ सुरक्षित हो रहा है...' : isEdit ? '✅ अपडेट करें' : '🚀 प्रकाशित करें'}
                        </button>
                    </div>
                </div>
            </form>

            <style>{`
                .ql-editor { min-height: 350px; font-size: 1rem; line-height: 1.6; }
                .ql-toolbar.ql-snow { border-top-left-radius: 14px; border-top-right-radius: 14px; background: #f8fafc; }
                .ql-container.ql-snow { border-bottom-left-radius: 14px; border-bottom-right-radius: 14px; }
            `}</style>
        </div>
    );
}
