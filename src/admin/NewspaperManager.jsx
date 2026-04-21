import React, { useState, useEffect } from 'react';
import { getNewspapers, addNewspaper, deleteNewspaper } from '../store/newsStore';

const EMPTY_FORM = {
    title: '',
    edition: '',
    pdfUrl: '',
    thumbnail: '',
    publishDate: new Date().toISOString().split('T')[0],
    isActive: true,
};

function formatDate(d) {
    try {
        return new Date(d).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return d; }
}

function CloudinaryGuide() {
    const [open, setOpen] = useState(false);
    return (
        <div style={{ marginBottom: '16px', border: '2px solid var(--teal)', borderRadius: '12px', overflow: 'hidden' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%', background: 'rgba(0,188,212,0.08)', border: 'none',
                    padding: '14px 18px', textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontWeight: 700, color: 'var(--navy)', fontSize: '0.92rem',
                }}
            >
                <span>📖 Cloudinary से PDF कैसे अपलोड करें? (Step by Step)</span>
                <span style={{ color: 'var(--teal)', fontSize: '1.1rem' }}>{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <div style={{ padding: '18px', background: 'white', fontSize: '0.85rem', lineHeight: 1.8 }}>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {[
                            { step: '1', text: 'cloudinary.com पर जाएं → Free account बनाएं (Sign Up)' },
                            { step: '2', text: 'Dashboard → Media Library → Upload → अपना PDF चुनें' },
                            { step: '3', text: 'Upload होने के बाद PDF पर क्लिक करें' },
                            { step: '4', text: '"Copy URL" बटन दबाएं → URL आपके clipboard में आ जाएगा' },
                            { step: '5', text: 'वह URL नीचे "PDF URL" field में paste करें' },
                        ].map(({ step, text }) => (
                            <div key={step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '26px', height: '26px', background: 'var(--teal)', color: 'white',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: '0.78rem', flexShrink: 0,
                                }}>
                                    {step}
                                </div>
                                <span style={{ color: 'var(--text-secondary)', paddingTop: '3px' }}>{text}</span>
                            </div>
                        ))}
                        <div style={{ background: 'var(--gray-100)', borderRadius: '8px', padding: '10px 14px', marginTop: '6px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '4px' }}>📌 Example URL:</div>
                            <code style={{ fontSize: '0.75rem', color: 'var(--teal)', wordBreak: 'break-all' }}>
                                https://res.cloudinary.com/YOUR_CLOUD/image/upload/sample.pdf
                            </code>
                        </div>
                        <a href="https://cloudinary.com" target="_blank" rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--teal)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', width: 'fit-content' }}>
                            🌐 Cloudinary खोलें →
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function NewspaperManager() {
    const [newspapers, setNewspapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: '' });
    const [confirmDelete, setConfirmDelete] = useState(null);

    const load = async () => {
        setLoading(true);
        const data = await getNewspapers();
        setNewspapers(data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: '' }), 3000);
    };

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.pdfUrl.trim()) return;
        setSaving(true);
        try {
            await addNewspaper(form);
            showToast('✅ ई-अखबार सफलतापूर्वक जोड़ा गया!');
            setForm(EMPTY_FORM);
            setShowForm(false);
            await load();
        } catch {
            showToast('❌ त्रुटि हुई। दोबारा कोशिश करें।', 'error');
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        try {
            await deleteNewspaper(id);
            showToast('🗑️ संस्करण हटा दिया गया।');
            setConfirmDelete(null);
            await load();
        } catch {
            showToast('❌ हटाने में त्रुटि।', 'error');
        }
    };

    return (
        <div style={{ maxWidth: '900px' }}>
            {toast.msg && (
                <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)' }}>🗞️ ई-अखबार प्रबंधन</h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem', marginTop: '4px' }}>
                        PDF अपलोड करें — यूज़र वेबसाइट पर ही पढ़ सकेंगे
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {showForm ? '✕ बंद करें' : '+ नया संस्करण जोड़ें'}
                </button>
            </div>

            {/* Info Banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(0,188,212,0.1), rgba(0,188,212,0.05))', border: '1px solid rgba(0,188,212,0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>✅</span>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--navy)' }}>PDF वेबसाइट पर ही खुलेगा</strong> — यूज़र को Google Drive नहीं जाना पड़ेगा।
                    PDF को <strong>Cloudinary</strong> पर अपलोड करें और URL यहाँ paste करें।
                    यूज़र को zoom, page navigation, और download — सब website पर मिलेगा।
                </div>
            </div>

            {/* Add Form */}
            {showForm && (
                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--card-shadow)', marginBottom: '28px' }}>
                    <h3 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--gray-200)' }}>
                        📋 नया ई-अखबार संस्करण
                    </h3>

                    {/* Cloudinary Guide */}
                    <CloudinaryGuide />

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">शीर्षक (Title) *</label>
                                <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)}
                                    placeholder="जैसे: JG News Plus - दैनिक संस्करण" required />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">संस्करण (Edition)</label>
                                <input className="form-control" value={form.edition} onChange={e => set('edition', e.target.value)}
                                    placeholder="जैसे: अंक 042 | अप्रैल 2025" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">प्रकाशन दिनांक</label>
                                <input type="date" className="form-control" value={form.publishDate} onChange={e => set('publishDate', e.target.value)} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                📄 PDF URL *
                                <span style={{ color: 'var(--teal)', fontWeight: 600, marginLeft: '8px', fontSize: '0.78rem' }}>
                                    (Cloudinary URL — यूज़र वेबसाइट पर पढ़ सकेंगे)
                                </span>
                            </label>
                            <input
                                className="form-control"
                                value={form.pdfUrl}
                                onChange={e => set('pdfUrl', e.target.value)}
                                placeholder="https://res.cloudinary.com/YOUR_CLOUD/image/upload/newspaper.pdf"
                                required
                                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                🖼️ थंबनेल (Cover Image URL)
                                <span style={{ color: 'var(--gray-600)', fontWeight: 400, fontSize: '0.78rem', marginLeft: '6px' }}>(वैकल्पिक)</span>
                            </label>
                            <input className="form-control" value={form.thumbnail} onChange={e => set('thumbnail', e.target.value)}
                                placeholder="https://res.cloudinary.com/YOUR_CLOUD/image/upload/cover.jpg" />
                            {form.thumbnail && (
                                <img src={form.thumbnail} alt="Preview" className="img-preview" style={{ maxHeight: '120px' }}
                                    onError={e => e.target.style.display = 'none'} />
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? '⏳ जोड़ा जा रहा है...' : '✅ प्रकाशित करें'}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>
                                रद्द करें
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Newspapers List */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--gray-200)' }}>
                    <h3 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1rem' }}>
                        📋 प्रकाशित संस्करण ({newspapers.length})
                    </h3>
                </div>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <div className="spinner" />
                    </div>
                ) : newspapers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🗞️</div>
                        <h3>कोई संस्करण नहीं</h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>ऊपर "+ नया संस्करण जोड़ें" से शुरू करें</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>थंबनेल</th>
                                    <th>शीर्षक / संस्करण</th>
                                    <th>दिनांक</th>
                                    <th>PDF Status</th>
                                    <th>क्रियाएं</th>
                                </tr>
                            </thead>
                            <tbody>
                                {newspapers.map(paper => (
                                    <tr key={paper.id}>
                                        <td>
                                            {paper.thumbnail ? (
                                                <img src={paper.thumbnail} alt="" className="data-table__thumb"
                                                    onError={e => e.target.style.display = 'none'} />
                                            ) : (
                                                <div style={{ width: '60px', height: '44px', background: 'var(--navy)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🗞️</div>
                                            )}
                                        </td>
                                        <td>
                                            <div className="data-table__title">{paper.title}</div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--teal)', marginTop: '2px' }}>{paper.edition}</div>
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                                            {formatDate(paper.publishDate)}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{ width: '8px', height: '8px', background: '#16a34a', borderRadius: '50%', display: 'inline-block' }} />
                                                <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700 }}>Website पर पढ़ें</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="data-table__actions">
                                                <a href={paper.pdfUrl} target="_blank" rel="noreferrer"
                                                    style={{ padding: '5px 10px', background: 'var(--teal)', color: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
                                                    👁️ देखें
                                                </a>
                                                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(paper)}
                                                    style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                                                    🗑️ हटाएं
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Delete Confirm Modal */}
            {confirmDelete && (
                <div className="modal-wrap" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal">
                        <div className="modal-title">🗑️ संस्करण हटाएं?</div>
                        <p style={{ color: 'var(--gray-600)', marginBottom: '20px', fontSize: '0.9rem' }}>
                            "<strong>{confirmDelete.title}</strong>" को हमेशा के लिए हटा दिया जाएगा।
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="btn btn-danger" onClick={() => handleDelete(confirmDelete.id)}>हां, हटाएं</button>
                            <button className="btn btn-outline" onClick={() => setConfirmDelete(null)}>रद्द करें</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
