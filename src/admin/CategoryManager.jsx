import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';

export default function CategoryManager() {
    const { categories, addCategory, deleteCategory } = useNews();
    const [newCat, setNewCat] = useState('');
    const [toast, setToast] = useState('');
    const [confirmDel, setConfirmDel] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newCat.trim()) return;
        if (categories.includes(newCat.trim())) {
            showToast('⚠️ यह श्रेणी पहले से मौजूद है');
            return;
        }
        addCategory(newCat.trim());
        setNewCat('');
        showToast(`✅ श्रेणी "${newCat.trim()}" जोड़ी गई`);
    };

    const handleDelete = (cat) => {
        deleteCategory(cat);
        setConfirmDel(null);
        showToast(`🗑️ श्रेणी "${cat}" हटाई गई`);
    };

    return (
        <div style={{ maxWidth: '700px' }}>
            {toast && <div className="toast toast-success">{toast}</div>}

            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '8px' }}>🏷️ श्रेणी प्रबंधन</h1>
            <p style={{ color: 'var(--gray-600)', marginBottom: '28px', fontSize: '0.88rem' }}>{categories.length} श्रेणियाँ</p>

            {/* Add New */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--card-shadow)', marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '16px' }}>➕ नई श्रेणी जोड़ें</h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <input
                        className="form-control"
                        value={newCat}
                        onChange={e => setNewCat(e.target.value)}
                        placeholder="श्रेणी का नाम हिंदी में..."
                        style={{ flex: 1, minWidth: '200px' }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={!newCat.trim()}>
                        ➕ जोड़ें
                    </button>
                </form>
            </div>

            {/* Categories List */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', background: 'var(--navy)' }}>
                    <span style={{ fontWeight: 800, color: 'white', fontSize: '0.88rem' }}>मौजूदा श्रेणियाँ</span>
                </div>
                {categories.map((cat, i) => (
                    <div key={cat} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 20px', borderBottom: i < categories.length - 1 ? '1px solid var(--gray-200)' : 'none',
                        transition: 'var(--transition)',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-100)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="badge badge-teal">{cat}</span>
                        </div>
                        <button
                            onClick={() => setConfirmDel(cat)}
                            className="btn btn-sm btn-danger"
                            style={{ opacity: 0.8 }}
                        >
                            🗑️ हटाएं
                        </button>
                    </div>
                ))}
                {categories.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏷️</div>
                        <h3>कोई श्रेणी नहीं है</h3>
                    </div>
                )}
            </div>

            {/* Confirm Delete */}
            {confirmDel && (
                <>
                    <div className="mobile-menu-overlay show" onClick={() => setConfirmDel(null)} />
                    <div className="modal-wrap">
                        <div className="modal">
                            <div className="modal-title">⚠️ श्रेणी हटाएं?</div>
                            <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem', marginBottom: '20px' }}>
                                श्रेणी "<strong>{confirmDel}</strong>" हटाने से इस श्रेणी की खबरें orphaned हो जाएंगी।
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button className="btn btn-sm" style={{ background: 'var(--gray-200)', color: 'var(--navy)' }} onClick={() => setConfirmDel(null)}>रद्द करें</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(confirmDel)}>🗑️ हटाएं</button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
