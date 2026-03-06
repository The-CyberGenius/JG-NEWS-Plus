import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useNews } from '../context/NewsContext';

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

export default function ArticleForm() {
    const { id } = useParams();
    const { articles, categories, addArticle, updateArticle } = useNews();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [imgPreview, setImgPreview] = useState('');

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
    }, [id, isEdit]);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleImgChange = (e) => {
        const val = e.target.value;
        set('image', val);
        setImgPreview(val);
    };

    const handleImgFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            set('image', reader.result);
            setImgPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setSaving(true);
        const data = {
            ...form,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        };
        setTimeout(() => {
            if (isEdit) {
                updateArticle(id, data);
                setToast('✅ खबर अपडेट हो गई!');
            } else {
                addArticle(data);
                setToast('✅ खबर सफलतापूर्वक जोड़ी गई!');
                setForm(EMPTY_FORM);
                setImgPreview('');
            }
            setSaving(false);
            setTimeout(() => { setToast(''); navigate('/admin/news'); }, 1500);
        }, 600);
    };

    return (
        <div style={{ maxWidth: '860px' }}>
            {toast && <div className="toast toast-success">{toast}</div>}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                <Link to="/admin/news" style={{ color: 'var(--teal)', fontWeight: 700, fontSize: '0.85rem' }}>← वापस</Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)' }}>
                    {isEdit ? '✏️ खबर संपादित करें' : '➕ नई खबर जोड़ें'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                <div style={{ display: 'grid', gap: '24px' }}>
                    {/* Main Content Card */}
                    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                        <h3 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--gray-200)' }}>
                            📝 खबर की जानकारी
                        </h3>

                        <div className="form-group">
                            <label className="form-label">शीर्षक (Title) *</label>
                            <input
                                className="form-control"
                                value={form.title}
                                onChange={e => set('title', e.target.value)}
                                placeholder="खबर का शीर्षक हिंदी में लिखें..."
                                required
                                style={{ fontSize: '1rem', fontWeight: 600 }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">सारांश (Excerpt)</label>
                            <textarea
                                className="form-control"
                                value={form.excerpt}
                                onChange={e => set('excerpt', e.target.value)}
                                placeholder="खबर का संक्षिप्त सारांश..."
                                style={{ minHeight: '80px' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">पूर्ण खबर (Content) *</label>
                            <textarea
                                className="form-control"
                                value={form.content}
                                onChange={e => set('content', e.target.value)}
                                placeholder="पूरी खबर यहाँ लिखें... (HTML tags supported)"
                                style={{ minHeight: '200px', fontFamily: 'var(--font-hindi)' }}
                                required
                            />
                            <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)', marginTop: '4px' }}>
                                💡 HTML टैग सपोर्टेड: &lt;p&gt;, &lt;b&gt;, &lt;i&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;
                            </div>
                        </div>
                    </div>

                    {/* Meta Card */}
                    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                        <h3 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--gray-200)' }}>
                            📌 श्रेणी और स्थान
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">श्रेणी (Category) *</label>
                                <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)} required>
                                    <option value="">-- श्रेणी चुनें --</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">स्थान (Location) *</label>
                                <select className="form-control" value={form.location} onChange={e => set('location', e.target.value)} required>
                                    <option value="">-- शहर/जिला चुनें --</option>
                                    {RAJASTHAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">लेखक (Author)</label>
                                <input className="form-control" value={form.author} onChange={e => set('author', e.target.value)} placeholder="JG News Desk" />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">टैग (Tags)</label>
                                <input className="form-control" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="जयपुर, बारिश, मानसून" />
                                <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)', marginTop: '4px' }}>कॉमा से अलग करें</div>
                            </div>
                        </div>
                    </div>

                    {/* Media Card */}
                    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                        <h3 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--gray-200)' }}>
                            🖼️ मीडिया (Photo & Video)
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                            <div>
                                <div className="form-group">
                                    <label className="form-label">📷 फोटो URL</label>
                                    <input className="form-control" value={form.image} onChange={handleImgChange} placeholder="https://example.com/image.jpg" />
                                </div>
                                <div className="form-group" style={{ marginTop: '-8px' }}>
                                    <label className="form-label">या फाइल अपलोड करें</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImgFile}
                                        className="form-control"
                                        style={{ padding: '8px' }}
                                    />
                                </div>
                                {imgPreview && (
                                    <img
                                        src={imgPreview}
                                        alt="Preview"
                                        className="img-preview"
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">🎬 YouTube Video URL (Embed)</label>
                                <input
                                    className="form-control"
                                    value={form.videoUrl}
                                    onChange={e => set('videoUrl', e.target.value)}
                                    placeholder="https://www.youtube.com/embed/VIDEO_ID"
                                />
                                <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)', marginTop: '6px' }}>
                                    💡 YouTube URL को embed format में लिखें:<br />
                                    <code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                                        youtube.com/embed/VIDEO_ID
                                    </code>
                                </div>
                                {form.videoUrl && (
                                    <div style={{ marginTop: '12px' }}>
                                        <div className="video-embed" style={{ borderRadius: 'var(--radius-sm)' }}>
                                            <iframe src={form.videoUrl} title="Video preview" allowFullScreen />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Toggles Card */}
                    <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--card-shadow)' }}>
                        <h3 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--gray-200)' }}>
                            ⚙️ प्रकाशन सेटिंग्स
                        </h3>

                        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                            <div>
                                <label className="toggle-label">
                                    <input
                                        type="checkbox"
                                        className="toggle-input"
                                        checked={form.isBreaking}
                                        onChange={e => set('isBreaking', e.target.checked)}
                                    />
                                    <span className="toggle-track" />
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--navy)' }}>🔴 ब्रेकिंग न्यूज़</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>टिकर में दिखाएं</div>
                                    </div>
                                </label>
                            </div>

                            <div>
                                <label className="toggle-label">
                                    <input
                                        type="checkbox"
                                        className="toggle-input"
                                        checked={form.isFeatured}
                                        onChange={e => set('isFeatured', e.target.checked)}
                                    />
                                    <span className="toggle-track" />
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--navy)' }}>⭐ फीचर्ड खबर</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>होमपेज पर हाइलाइट करें</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingBottom: '24px' }}>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1rem' }} disabled={saving}>
                            {saving ? '⏳ सेव हो रहा है...' : isEdit ? '✅ अपडेट करें' : '✅ खबर प्रकाशित करें'}
                        </button>
                        <Link to="/admin/news" className="btn btn-outline">रद्द करें</Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
