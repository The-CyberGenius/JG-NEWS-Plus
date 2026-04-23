import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';
import { uploadImage } from '../store/newsStore';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RAJASTHAN_DISTRICTS = [
    'अजमेर', 'अलवर', 'अनूपगढ़', 'बालोतरा', 'बांसवाड़ा', 'बारां', 'बाड़मेर', 'ब्यावर', 'भरतपुर', 'भीलवाड़ा', 'बीकानेर', 'बूंदी', 'चित्तौड़गढ़', 'चूरू', 'दौसा', 'डीग', 'धौलपुर', 'डीडवाना-कुचामन', 'दूदू', 'डूंगरपुर', 'गंगानगर', 'गंगापुर सिटी', 'हनुमानगढ़', 'जयपुर', 'जयपुर ग्रामीण', 'जैसलमेर', 'जालौर', 'झालावाड़', 'झुंझुनूं', 'जोधपुर', 'जोधपुर ग्रामीण', 'करौली', 'केकड़ी', 'खैरथल-तिजारा', 'कोटा', 'कोटपुतली-बहरोड़', 'नागौर', 'नीम का थाना', 'पाली', 'फलोदी', 'प्रतापगढ़', 'राजसमंद', 'सलुंबर', 'सांचौर', 'सवाई माधोपुर', 'शाहpura', 'सीकर', 'सिरोही', 'टोंक', 'उदयपुर', 'अन्य'
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

export default function ArticleForm() {
    const { id } = useParams();
    const { articles, categories, addArticle, updateArticle } = useNews();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const quillRef = useRef(null);

    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [imgPreview, setImgPreview] = useState('');
    const [imageFile, setImageFile] = useState(null);

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
                setToast('⏳ मुख्य फोटो अपलोड हो रही है...');
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
                        Optimized Cloudinary uploads के साथ मीडिया मैनेज करें
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }}>

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
                                    <div className="editor-container" style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                                        <ReactQuill
                                            ref={quillRef}
                                            theme="snow"
                                            value={form.content}
                                            onChange={val => set('content', val)}
                                            modules={modules}
                                            style={{ height: '400px', background: 'white' }}
                                        />
                                    </div>
                                    <p style={{ marginTop: '50px', fontSize: '0.75rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>
                                        💡 Tip: एडिटर के बीच में फोटो डालने पर वो Cloudinary पर ऑटो-अपलोड होगी।
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
                                    {RAJASTHAN_DISTRICTS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input className="form-control" value={form.author} onChange={e => set('author', e.target.value)} placeholder="लेखक का नाम" />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ padding: '18px', width: '100%', borderRadius: '16px' }} disabled={saving}>
                            {saving ? '⏳ सुरक्षित हो रहा है...' : isEdit ? '✅ अपडेट करें' : '🚀 प्रकाशित करें'}
                        </button>
                    </div>
                </div>
            </form>

            <style>{`
                .ql-editor { min-height: 350px; font-size: 1.1rem; line-height: 1.7; color: #334155; }
                .ql-toolbar.ql-snow { border-top-left-radius: 14px; border-top-right-radius: 14px; background: #f8fafc; padding: 12px; }
                .ql-container.ql-snow { border-bottom-left-radius: 14px; border-bottom-right-radius: 14px; }
                .ql-editor img { max-width: 100%; border-radius: 12px; margin: 15px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            `}</style>
        </div>
    );
}
