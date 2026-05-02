import React, { useState, useEffect, useRef } from 'react';
import { getNewspapers, addNewspaper, updateNewspaper, deleteNewspaper, uploadPDF, uploadImage } from '../store/newsStore';

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

function todayTitle() {
    return new Date().toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' });
}

function guessEdition(newspapers) {
    // Try to find last edition number and increment
    if (!newspapers || newspapers.length === 0) return 'अंक 001';
    // Sort by date descending
    const sorted = [...newspapers].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    const last = sorted[0]?.edition || '';
    const match = last.match(/(\d+)/);
    if (match) {
        const next = String(parseInt(match[1]) + 1).padStart(3, '0');
        return last.replace(/\d+/, next);
    }
    return `अंक 00${newspapers.length + 1}`;
}

function SmallProgress({ progress }) {
    return (
        <div style={{ background: 'var(--gray-200)', borderRadius: '100px', height: '6px', overflow: 'hidden', marginTop: '8px' }}>
            <div style={{ background: 'var(--teal)', height: '100%', width: `${progress}%`, borderRadius: '100px', transition: '0.3s ease' }} />
        </div>
    );
}

export default function NewspaperManager() {
    const [newspapers, setNewspapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('list'); // 'list' | 'quick' | 'advanced' | 'edit'
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ msg: '', type: '' });
    const [editId, setEditId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Upload states
    const [pdfUploading, setPdfUploading] = useState(false);
    const [pdfProgress, setPdfProgress] = useState(0);
    const [imgUploading, setImgUploading] = useState(false);

    const pdfInputRef = useRef();
    const imgInputRef = useRef();

    const load = async () => {
        setLoading(true);
        const data = await getNewspapers();
        setNewspapers(data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast({ msg: '', type: '' }), 4000);
    };

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    // Quick Post: opens form with auto-filled fields
    const openQuickPost = () => {
        setForm({
            ...EMPTY_FORM,
            title: `युगपक्ष - ${todayTitle()}`,
            edition: guessEdition(newspapers),
            publishDate: new Date().toISOString().split('T')[0],
        });
        setEditId(null);
        setPdfProgress(0);
        setShowAdvanced(false);
        setMode('quick');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // PDF Upload handler
    const handlePDFSelect = async (file) => {
        if (!file) return;
        setPdfUploading(true);
        setPdfProgress(0);
        try {
            const result = await uploadPDF(file, setPdfProgress);
            set('pdfUrl', result.url);
            // Auto-fill title from filename if empty
            setForm(f => ({
                ...f,
                pdfUrl: result.url,
                title: f.title || file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' '),
            }));
            showToast(`✅ PDF अपलोड सफल! (${(result.bytes / 1024 / 1024).toFixed(1)} MB)`);
        } catch (err) {
            showToast('❌ PDF अपलोड विफल: ' + (err.response?.data?.message || err.message), 'error');
        }
        setPdfUploading(false);
    };

    // Image Upload handler
    const handleImageSelect = async (file) => {
        if (!file) return;
        setImgUploading(true);
        try {
            const result = await uploadImage(file);
            set('thumbnail', result.url);
            showToast('🖼️ Cover अपलोड सफल!');
        } catch (err) {
            showToast('❌ Image अपलोड विफल: ' + (err.response?.data?.message || err.message), 'error');
        }
        setImgUploading(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file?.type === 'application/pdf') handlePDFSelect(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.pdfUrl.trim()) {
            showToast('❌ शीर्षक और PDF जरूरी है', 'error');
            return;
        }
        setSaving(true);
        try {
            if (editId) {
                await updateNewspaper(editId, form);
                showToast('✅ ई-अखबार सफलतापूर्वक अपडेट!');
            } else {
                await addNewspaper(form);
                showToast('🎉 आज का अखबार Live हो गया!');
            }
            setForm(EMPTY_FORM);
            setEditId(null);
            setPdfProgress(0);
            setMode('list');
            await load();
        } catch {
            showToast('❌ त्रुटि हुई। दोबारा कोशिश करें।', 'error');
        }
        setSaving(false);
    };

    const handleEdit = (paper) => {
        setForm({
            title: paper.title,
            edition: paper.edition,
            pdfUrl: paper.pdfUrl,
            thumbnail: paper.thumbnail,
            publishDate: paper.publishDate.split('T')[0],
            isActive: paper.isActive,
        });
        setEditId(paper.id);
        setShowAdvanced(true);
        setMode('edit');
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    const cancelForm = () => {
        setMode('list');
        setForm(EMPTY_FORM);
        setEditId(null);
        setPdfProgress(0);
        setShowAdvanced(false);
    };

    const isFormOpen = mode === 'quick' || mode === 'edit';

    return (
        <div style={{ maxWidth: '900px' }}>
            {/* Toast */}
            {toast.msg && (
                <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)' }}>🗞️ ई-अखबार</h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem', marginTop: '4px' }}>
                        PDF अपलोड करें, एक क्लिक में Live करें
                    </p>
                </div>
                {!isFormOpen && (
                    <button
                        className="btn btn-primary"
                        onClick={openQuickPost}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', padding: '10px 20px' }}
                    >
                        📤 आज का अखबार अपलोड करें
                    </button>
                )}
            </div>

            {/* ── QUICK POST / EDIT FORM ── */}
            {isFormOpen && (
                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--card-shadow)', marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '2px solid var(--gray-200)' }}>
                        <h3 style={{ fontWeight: 800, color: 'var(--navy)', margin: 0 }}>
                            {editId ? '✏️ ई-अखबार संपादित करें' : '📤 आज का अखबार'}
                        </h3>
                        <button onClick={cancelForm} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--gray-500)' }}>✕</button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* STEP 1: PDF Drop Zone — BIG and prominent */}
                        <div
                            onDragOver={e => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => !pdfUploading && pdfInputRef.current.click()}
                            style={{
                                border: `3px dashed ${form.pdfUrl ? '#16a34a' : pdfUploading ? 'var(--teal)' : 'var(--gray-300)'}`,
                                borderRadius: '16px',
                                padding: '36px 24px',
                                textAlign: 'center',
                                cursor: pdfUploading ? 'wait' : 'pointer',
                                background: form.pdfUrl ? 'rgba(22,163,74,0.04)' : pdfUploading ? 'rgba(0,188,212,0.04)' : 'var(--gray-50)',
                                transition: '0.2s ease',
                                marginBottom: '20px',
                            }}
                        >
                            <input
                                ref={pdfInputRef}
                                type="file"
                                accept="application/pdf"
                                style={{ display: 'none' }}
                                onChange={e => e.target.files[0] && handlePDFSelect(e.target.files[0])}
                            />
                            {pdfUploading ? (
                                <div>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⏳</div>
                                    <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '12px' }}>अपलोड हो रहा है... {pdfProgress}%</div>
                                    <div style={{ background: 'var(--gray-200)', borderRadius: '100px', height: '10px', overflow: 'hidden', maxWidth: '300px', margin: '0 auto' }}>
                                        <div style={{ background: 'var(--teal)', height: '100%', width: `${pdfProgress}%`, borderRadius: '100px', transition: '0.3s ease' }} />
                                    </div>
                                </div>
                            ) : form.pdfUrl ? (
                                <div>
                                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>✅</div>
                                    <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '1rem', marginBottom: '6px' }}>PDF अपलोड सफल!</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--gray-500)', maxWidth: '400px', margin: '0 auto', wordBreak: 'break-all' }}>{form.pdfUrl}</div>
                                    <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--teal)', fontWeight: 600 }}>दूसरी PDF के लिए यहाँ क्लिक करें</div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📄</div>
                                    <div style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1.1rem', marginBottom: '6px' }}>PDF यहाँ खींचें या क्लिक करें</div>
                                    <div style={{ color: 'var(--gray-500)', fontSize: '0.82rem' }}>अखबार की PDF फ़ाइल चुनें • Max 50MB</div>
                                </div>
                            )}
                        </div>

                        {/* Title — auto-filled, editable */}
                        <div className="form-group">
                            <label className="form-label">📰 शीर्षक *</label>
                            <input
                                className="form-control"
                                value={form.title}
                                onChange={e => set('title', e.target.value)}
                                placeholder="जैसे: युगपक्ष - 2 मई 2026"
                                required
                            />
                        </div>

                        {/* Advanced Toggle */}
                        <button
                            type="button"
                            onClick={() => setShowAdvanced(v => !v)}
                            style={{ background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', padding: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            {showAdvanced ? '▲' : '▼'} {showAdvanced ? 'कम विकल्प' : 'और विकल्प (Edition, Date, Cover)'}
                        </button>

                        {/* Advanced Fields */}
                        {showAdvanced && (
                            <div style={{ background: 'var(--gray-50)', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid var(--gray-200)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">संस्करण (Edition)</label>
                                        <input className="form-control" value={form.edition} onChange={e => set('edition', e.target.value)}
                                            placeholder="जैसे: अंक 042 | अप्रैल 2026" />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label className="form-label">प्रकाशन दिनांक</label>
                                        <input type="date" className="form-control" value={form.publishDate} onChange={e => set('publishDate', e.target.value)} />
                                    </div>
                                </div>

                                {/* Cover Image upload */}
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">🖼️ Cover Image (वैकल्पिक)</label>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                        <div
                                            onClick={() => !imgUploading && imgInputRef.current.click()}
                                            style={{
                                                border: `2px dashed ${form.thumbnail ? '#16a34a' : 'var(--gray-300)'}`,
                                                borderRadius: '10px',
                                                padding: '14px 20px',
                                                cursor: imgUploading ? 'wait' : 'pointer',
                                                background: form.thumbnail ? 'rgba(22,163,74,0.04)' : 'white',
                                                textAlign: 'center',
                                                fontSize: '0.82rem',
                                                color: 'var(--navy)',
                                                fontWeight: 600,
                                                minWidth: '140px',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <input
                                                ref={imgInputRef}
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={e => e.target.files[0] && handleImageSelect(e.target.files[0])}
                                            />
                                            {imgUploading ? '⏳ अपलोड...' : form.thumbnail ? '✅ बदलें' : '📷 Upload'}
                                        </div>
                                        {form.thumbnail && (
                                            <img src={form.thumbnail} alt="cover"
                                                style={{ height: '70px', width: '50px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #16a34a' }}
                                                onError={e => e.target.style.display = 'none'} />
                                        )}
                                        {!form.thumbnail && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', paddingTop: '4px' }}>
                                                Cover photo नहीं देने पर<br />default design दिखेगा
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Manual PDF URL */}
                                <div className="form-group" style={{ marginBottom: 0, marginTop: '14px' }}>
                                    <label className="form-label" style={{ fontSize: '0.78rem', color: 'var(--gray-600)' }}>या PDF URL manually डालें</label>
                                    <input
                                        className="form-control"
                                        value={form.pdfUrl}
                                        onChange={e => set('pdfUrl', e.target.value)}
                                        placeholder="https://res.cloudinary.com/..."
                                        style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving || pdfUploading || !form.pdfUrl || !form.title}
                                style={{ padding: '11px 28px', fontSize: '1rem', fontWeight: 800 }}
                            >
                                {saving ? '⏳ सेव हो रहा है...' : editId ? '💾 अपडेट करें' : '🚀 Live करें'}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={cancelForm}>
                                रद्द करें
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Newspapers List */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontWeight: 800, color: 'var(--navy)', fontSize: '1rem', margin: 0 }}>
                        📋 प्रकाशित संस्करण ({newspapers.length})
                    </h3>
                    {!isFormOpen && newspapers.length > 0 && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>
                            नवीनतम: {formatDate(newspapers[0]?.publishDate)}
                        </span>
                    )}
                </div>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <div className="spinner" />
                    </div>
                ) : newspapers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🗞️</div>
                        <h3>कोई संस्करण नहीं</h3>
                        <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem' }}>ऊपर "आज का अखबार अपलोड करें" से शुरू करें</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Cover</th>
                                    <th>शीर्षक / संस्करण</th>
                                    <th>दिनांक</th>
                                    <th>Status</th>
                                    <th>क्रियाएं</th>
                                </tr>
                            </thead>
                            <tbody>
                                {newspapers.map(paper => (
                                    <tr key={paper.id}>
                                        <td>
                                            {paper.thumbnail ? (
                                                <img src={paper.thumbnail} alt="" className="data-table__thumb"
                                                    style={{ width: '44px', height: '62px', objectFit: 'cover' }}
                                                    onError={e => e.target.style.display = 'none'} />
                                            ) : (
                                                <div style={{ width: '44px', height: '62px', background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🗞️</div>
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
                                                <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>Live</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="data-table__actions">
                                                <a href={paper.pdfUrl} target="_blank" rel="noreferrer"
                                                    style={{ padding: '5px 10px', background: 'var(--teal)', color: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                                    👁️
                                                </a>
                                                <button className="btn btn-navy btn-sm" onClick={() => handleEdit(paper)}
                                                    style={{ padding: '5px 10px', fontSize: '0.75rem', background: 'var(--navy-mid)' }}>
                                                    ✏️
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(paper)}
                                                    style={{ padding: '5px 10px', fontSize: '0.75rem' }}>
                                                    🗑️
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

            {/* Delete Modal */}
            {confirmDelete && (
                <div className="modal-wrap" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal">
                        <div className="modal-title">🗑️ संस्करण हटाएं?</div>
                        <p style={{ color: 'var(--gray-600)', marginBottom: '20px', fontSize: '0.9rem' }}>
                            "<strong>{confirmDelete.title}</strong>" हमेशा के लिए हटा दिया जाएगा।
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
