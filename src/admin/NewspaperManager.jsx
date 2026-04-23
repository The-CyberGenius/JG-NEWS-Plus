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

function FileUploadZone({ accept, label, icon, onFileSelect, uploading, progress, uploadedUrl, small }) {
    const inputRef = useRef();
    const [dragging, setDragging] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFileSelect(file);
    };

    return (
        <div>
            <div
                onClick={() => !uploading && inputRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                    border: `2px dashed ${dragging ? 'var(--teal)' : uploadedUrl ? '#16a34a' : 'var(--gray-300)'}`,
                    borderRadius: '12px',
                    padding: small ? '16px' : '28px',
                    textAlign: 'center',
                    cursor: uploading ? 'wait' : 'pointer',
                    background: dragging ? 'rgba(0,188,212,0.05)' : uploadedUrl ? 'rgba(22,163,74,0.05)' : 'var(--gray-50)',
                    transition: '0.2s ease',
                }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    style={{ display: 'none' }}
                    onChange={e => e.target.files[0] && onFileSelect(e.target.files[0])}
                />

                {uploading ? (
                    <div>
                        <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>⏳</div>
                        <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '10px', fontSize: '0.9rem' }}>अपलोड हो रहा है... {progress}%</div>
                        <div style={{ background: 'var(--gray-200)', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
                            <div style={{ background: 'var(--teal)', height: '100%', width: `${progress}%`, borderRadius: '100px', transition: '0.3s ease' }} />
                        </div>
                    </div>
                ) : uploadedUrl ? (
                    <div>
                        <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>✅</div>
                        <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.85rem', marginBottom: '4px' }}>अपलोड सफल!</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--gray-600)', wordBreak: 'break-all', maxWidth: '300px', margin: '0 auto' }}>{uploadedUrl}</div>
                        <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--teal)', fontWeight: 600 }}>दूसरी फ़ाइल के लिए क्लिक करें</div>
                    </div>
                ) : (
                    <div>
                        <div style={{ fontSize: small ? '1.6rem' : '2.4rem', marginBottom: '8px' }}>{icon}</div>
                        <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: small ? '0.85rem' : '0.95rem' }}>{label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: '4px' }}>
                            क्लिक करें या फ़ाइल यहाँ खींचें
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: '6px' }}>
                            {accept === 'application/pdf' ? 'PDF • Max 50MB' : 'JPG, PNG, WebP • Max 10MB'}
                        </div>
                    </div>
                )}
            </div>
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
    const [editId, setEditId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Upload states
    const [pdfUploading, setPdfUploading] = useState(false);
    const [pdfProgress, setPdfProgress] = useState(0);
    const [imgUploading, setImgUploading] = useState(false);

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

    // PDF Upload handler
    const handlePDFSelect = async (file) => {
        setPdfUploading(true);
        setPdfProgress(0);
        try {
            const result = await uploadPDF(file, setPdfProgress);
            set('pdfUrl', result.url);
            showToast(`✅ PDF अपलोड सफल! (${(result.bytes / 1024 / 1024).toFixed(1)} MB)`);
        } catch (err) {
            showToast('❌ PDF अपलोड विफल: ' + (err.response?.data?.message || err.message), 'error');
        }
        setPdfUploading(false);
    };

    // Image Upload handler
    const handleImageSelect = async (file) => {
        setImgUploading(true);
        try {
            const result = await uploadImage(file);
            set('thumbnail', result.url);
            showToast('🖼️ थंबनेल अपलोड सफल!');
        } catch (err) {
            showToast('❌ Image अपलोड विफल: ' + (err.response?.data?.message || err.message), 'error');
        }
        setImgUploading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.pdfUrl.trim()) {
            showToast('❌ शीर्षक और PDF URL जरूरी है', 'error');
            return;
        }
        setSaving(true);
        try {
            if (editId) {
                await updateNewspaper(editId, form);
                showToast('✅ ई-अखबार सफलतापूर्वक अपडेट किया गया!');
            } else {
                await addNewspaper(form);
                showToast('✅ ई-अखबार सफलतापूर्वक प्रकाशित!');
            }
            setForm(EMPTY_FORM);
            setEditId(null);
            setPdfProgress(0);
            setShowForm(false);
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
        setShowForm(true);
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
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)' }}>🗞️ ई-अखबार प्रबंधन</h1>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.85rem', marginTop: '4px' }}>
                        PDF सीधे यहाँ अपलोड करें — यूज़र वेबसाइट पर ही पढ़ सकेंगे
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); if(showForm) { setForm(EMPTY_FORM); setEditId(null); } }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {showForm ? '✕ बंद करें' : '+ नया संस्करण जोड़ें'}
                </button>
            </div>

            {/* How-it-works banner */}
            <div style={{ background: 'linear-gradient(135deg, rgba(0,188,212,0.08), rgba(0,188,212,0.03))', border: '1px solid rgba(0,188,212,0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>✅</span>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--navy)' }}>PDF सीधे अपलोड करें</strong> —
                    PDF यहाँ upload होगा, Cloudinary पर store होगा, और यूज़र को website पर ही दिखेगा।
                    कोई Google Drive, कोई redirect नहीं।
                </div>
            </div>

            {/* Add Form */}
            {showForm && (
                <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--card-shadow)', marginBottom: '28px' }}>
                    <h3 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--gray-200)' }}>
                        📋 {editId ? 'ई-अखबार संपादित करें' : 'नया ई-अखबार प्रकाशित करें'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        {/* Basic details */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">शीर्षक *</label>
                                <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)}
                                    placeholder="जैसे: युगपक्ष - 20 अप्रैल 2026" required />
                            </div>
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

                        {/* PDF Upload */}
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ background: 'var(--saffron)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>STEP 1</span>
                                PDF Upload करें *
                            </label>
                            <FileUploadZone
                                accept="application/pdf"
                                label="PDF Newspaper यहाँ अपलोड करें"
                                icon="📄"
                                onFileSelect={handlePDFSelect}
                                uploading={pdfUploading}
                                progress={pdfProgress}
                                uploadedUrl={form.pdfUrl}
                            />
                            {/* Or paste URL manually */}
                            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }} />
                                <span style={{ color: 'var(--gray-500)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>या manually URL paste करें</span>
                                <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }} />
                            </div>
                            <input
                                className="form-control"
                                value={form.pdfUrl}
                                onChange={e => set('pdfUrl', e.target.value)}
                                placeholder="https://res.cloudinary.com/dsczo1zim/raw/upload/..."
                                style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '0.82rem' }}
                            />
                        </div>

                        {/* Thumbnail Upload */}
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ background: 'var(--teal)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 800 }}>STEP 2</span>
                                Cover Image (वैकल्पिक)
                            </label>
                            <FileUploadZone
                                accept="image/*"
                                label="अखबार का Cover Photo"
                                icon="🖼️"
                                onFileSelect={handleImageSelect}
                                uploading={imgUploading}
                                progress={100}
                                uploadedUrl={form.thumbnail}
                                small
                            />
                            {form.thumbnail && (
                                <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--gray-100)', borderRadius: '8px', padding: '8px 12px' }}>
                                    <img src={form.thumbnail} alt="thumbnail" style={{ height: '60px', width: '44px', objectFit: 'cover', borderRadius: '4px' }} onError={e => e.target.style.display = 'none'} />
                                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', wordBreak: 'break-all' }}>{form.thumbnail}</div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button type="submit" className="btn btn-primary" disabled={saving || pdfUploading || !form.pdfUrl}>
                                {saving ? '⏳ सेव हो रहा है...' : editId ? '💾 अपडेट करें' : '✅ प्रकाशित करें'}
                            </button>
                            <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setEditId(null); setPdfProgress(0); }}>
                                रद्द करें
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Newspapers List Table */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
