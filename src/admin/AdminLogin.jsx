import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNews } from '../context/NewsContext';

export default function AdminLogin() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, adminAuth } = useNews();
    const navigate = useNavigate();

    if (adminAuth) {
        navigate('/admin/dashboard');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const ok = await login(password);
            if (ok) {
                navigate('/admin/dashboard');
            } else {
                setError('गलत पासवर्ड। फिर से कोशिश करें।');
                setLoading(false);
            }
        } catch (err) {
            setError('सर्वर से संपर्क करने में त्रुटि।');
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'var(--font-hindi)' }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '40px 32px', width: '100%', maxWidth: '400px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)', textAlign: 'center' }}>
                {/* Logo */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '4px' }}>
                        JG <span style={{ color: 'var(--teal)' }}>NEWS</span> <span style={{ color: 'var(--saffron)' }}>Plus</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-600)', fontWeight: 600 }}>Admin Control Panel</div>
                </div>

                <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '28px' }}>
                    <div style={{ color: 'var(--teal)', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '1px' }}>🔐 ADMIN LOGIN</div>
                </div>

                {error && (
                    <div style={{ background: '#fee2e2', color: 'var(--red)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', fontSize: '0.88rem', fontWeight: 600 }}>
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="form-label">Username</label>
                        <input className="form-control" value="admin" readOnly style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }} />
                    </div>
                    <div className="form-group" style={{ textAlign: 'left' }}>
                        <label className="form-label">Password</label>
                        <input
                            className="form-control"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="पासवर्ड दर्ज करें"
                            required
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }} disabled={loading}>
                        {loading ? '⏳ लॉगिन हो रहा है...' : '🔐 Login करें'}
                    </button>
                </form>


                <a href="/" style={{ display: 'block', marginTop: '20px', color: 'var(--teal)', fontSize: '0.85rem', fontWeight: 600 }}>
                    ← वेबसाइट पर वापस जाएं
                </a>
            </div>
        </div>
    );
}
