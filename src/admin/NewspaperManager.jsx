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
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)' }}>📰 ई-अखबार प्रबंधन</h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem', marginTop: '4px' }}>
                        PDF संस्करण अपलोड करें और प्रबंधित करें
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {showForm ? '✕ बंद करें' : '+ नया संस्करण जोड़ें'}
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--card-shadow)', marginBottom: '28px' }}>
                    <h3 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--gray-200)' }}>
                        📋 नया ई-अखबार संस्करण
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">शीर्षक (Title) *</label>
                                <input
                                    className="form-control"
                                    value={form.title}
                                    onChange={e => set('title', e.target.value)}
                                    placeholder="जैसे: JG News Plus - दैनिक संस्करण"
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">संस्करण (Edition)</label>
                                <input
                                    className="form-control"
                                    value={form.edition}
                                    onChange={e => set('edition', e.target.value)}
                                    placeholder="जैसे: अंक 042 | अप्रैल 2025"
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">प्रकाशन दिनांक</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={form.publishDate}
                                    onChange={e => set('publishDate', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">📄 PDF URL * <span style={{ color: 'var(--gray-600)', fontWeight: 400, fontSize: '0.78rem' }}>(Google Drive, Cloudinary, या अन्य CDN से लिंक)</span></label>
                            <input
                                className="form-control"
                                value={form.pdfUrl}
                                onChange={e => set('pdfUrl', e.target.value)}
                                placeholder="https://drive.google.com/file/d/FILE_ID/preview"
                                required
                            />
                            <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)', marginTop: '6px', background: 'var(--gray-100)', padding: '8px 12px', borderRadius: '6px' }}>
                                💡 <strong>Google Drive:</strong> File को "Anyone with link can view" करें → Share → Copy link<br />
                                फिर link को इस format में बदलें:<br />
                                <code style={{ fontSize: '0.68rem', background: 'var(--gray-200)', padding: '2px 6px', borderRadius: '4px' }}>
                                    https://drive.google.com/file/d/FILE_ID/preview
                                </code>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">🖼️ थंबनेल Image URL <span style={{ color: 'var(--gray-600)', fontWeight: 400, fontSize: '0.78rem' }}>(वैकल्पिक — न हो तो default icon दिखेगा)</span></label>
                            <input
                                className="form-control"
                                value={form.thumbnail}
                                onChange={e => set('thumbnail', e.target.value)}
                                placeholder="https://example.com/newspaper-thumbnail.jpg"
                            />
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
                <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1rem' }}>
                        📋 सभी संस्करण ({newspapers.length})
                    </h3>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <div className="spinner" />
                    </div>
                ) : newspapers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📰</div>
                        <h3>कोई संस्करण नहीं मिला</h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>ऊपर "+ नया संस्करण जोड़ें" पर क्लिक करके शुरू करें</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>थंबनेल</th>
                                    <th>शीर्षक / संस्करण</th>
                                    <th>दिनांक</th>
                                    <th>PDF</th>
                                    <th>क्रियाएं</th>
                                </tr>
                            </thead>
                            <tbody>
                                {newspapers.map(paper => (
                                    <tr key={paper.id}>
                                        <td>
                                            {paper.thumbnail ? (
                                                <img src={paper.thumbnail} alt="" className="data-table__thumb" onError={e => { e.target.style.display = 'none'; }} />
                                            ) : (
                                                <div style={{ width: '60px', height: '44px', background: 'var(--navy)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                                                    📰
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div className="data-table__title">{paper.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--teal)', marginTop: '2px' }}>{paper.edition}</div>
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                                            {formatDate(paper.publishDate)}
                                        </td>
                                        <td>
                                            <a href={paper.pdfUrl} target="_blank" rel="noreferrer"
                                                style={{ color: 'var(--teal)', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                                                </svg>
                                                खोलें
                                            </a>
                                        </td>
                                        <td>
                                            <div className="data-table__actions">
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => setConfirmDelete(paper)}
                                                    style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                                                >
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

            {/* Delete Confirmation Modal */}
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
