import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { recategorizeArticles } from '../store/newsStore';

// Standard professional news categories (preset names — no auto-classification)
const SUGGESTED_DEFAULT_CATEGORIES = [
    'अपराध', 'राजनीति', 'खेल', 'मनोरंजन', 'व्यापार', 'शिक्षा', 'स्वास्थ्य', 'तकनीक', 'भारत', 'दुनिया'
];

export default function CategoryManager() {
    const { categories, addCategory, deleteCategory, refreshAll } = useNews();
    const [newCat, setNewCat] = useState('');
    const [toast, setToast] = useState('');
    const [confirmDel, setConfirmDel] = useState(null);
    const [recatFrom, setRecatFrom] = useState('');
    const [recatTo, setRecatTo] = useState('');
    const [recatBusy, setRecatBusy] = useState(false);

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

    const handleSeedDefaults = async () => {
        const missing = SUGGESTED_DEFAULT_CATEGORIES.filter(c => !categories.includes(c));
        if (missing.length === 0) {
            showToast('✅ सभी default categories पहले से मौजूद हैं');
            return;
        }
        if (!window.confirm(`${missing.length} default categories add karein?\n\n${missing.join(', ')}`)) return;
        for (const cat of missing) {
            try { await addCategory(cat); } catch { /* ignore individual failures */ }
        }
        showToast(`✅ ${missing.length} categories add ho gayi`);
    };

    const handleRecategorize = async () => {
        if (!recatFrom || !recatTo) {
            showToast('⚠️ दोनों श्रेणियाँ चुनें');
            return;
        }
        if (recatFrom === recatTo) {
            showToast('⚠️ दोनों श्रेणियाँ अलग होनी चाहिए');
            return;
        }
        if (!window.confirm(`क्या आप वाकई "${recatFrom}" की सारी खबरें "${recatTo}" में move करना चाहते हैं?`)) return;
        setRecatBusy(true);
        try {
            const result = await recategorizeArticles({ from: recatFrom, to: recatTo });
            showToast(`✅ ${result.modified} खबरें "${recatTo}" में move हो गईं`);
            setRecatFrom('');
            setRecatTo('');
            if (refreshAll) refreshAll();
        } catch (err) {
            showToast('❌ Recategorize fail hua: ' + (err?.response?.data?.message || err.message));
        } finally {
            setRecatBusy(false);
        }
    };

    return (
        <div style={{ maxWidth: '700px' }}>
            {toast && <div className="toast toast-success">{toast}</div>}

            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '8px' }}>🏷️ श्रेणी प्रबंधन</h1>
            <p style={{ color: 'var(--gray-600)', marginBottom: '28px', fontSize: '0.88rem' }}>{categories.length} श्रेणियाँ</p>

            {/* Add New */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--card-shadow)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ fontWeight: 800, color: 'var(--navy)' }}>➕ नई श्रेणी जोड़ें</h3>
                    <button
                        type="button"
                        onClick={handleSeedDefaults}
                        className="btn btn-outline btn-sm"
                        title={`Default professional news categories: ${SUGGESTED_DEFAULT_CATEGORIES.join(', ')}`}
                    >
                        ✨ Seed Default Categories
                    </button>
                </div>
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

            {/* Bulk Recategorize */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--card-shadow)', marginBottom: '24px', border: '2px dashed var(--saffron-light)' }}>
                <h3 style={{ fontWeight: 800, color: 'var(--navy)', marginBottom: '8px' }}>🔀 Bulk Recategorize</h3>
                <p style={{ color: 'var(--gray-600)', fontSize: '0.82rem', marginBottom: '16px' }}>
                    Ek category ki saari news ko doosri category me move karo. Useful agar aap "राजस्थान" jaisi general category ki articles ko proper topical categories (अपराध, राजनीति, etc.) me distribute karna chahte ho.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <label className="form-label">From (source)</label>
                        <select className="form-control" value={recatFrom} onChange={e => setRecatFrom(e.target.value)} disabled={recatBusy}>
                            <option value="">श्रेणी चुनें...</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div style={{ fontSize: '1.4rem', paddingBottom: '12px' }}>→</div>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <label className="form-label">To (target)</label>
                        <select className="form-control" value={recatTo} onChange={e => setRecatTo(e.target.value)} disabled={recatBusy}>
                            <option value="">श्रेणी चुनें...</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleRecategorize}
                        className="btn btn-primary"
                        disabled={recatBusy || !recatFrom || !recatTo}
                    >
                        {recatBusy ? '⏳ Moving…' : '🔀 Move All'}
                    </button>
                </div>
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
