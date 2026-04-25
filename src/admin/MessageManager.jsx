import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { api } from '../store/newsStore';

export default function MessageManager() {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const res = await api.get('/messages', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessages(res.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('क्या आप वाकई इस संदेश को हटाना चाहते हैं?')) return;
        try {
            const token = localStorage.getItem('adminToken');
            await api.delete(`/messages/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessages(messages.filter(msg => msg._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('adminToken');
            await api.put(`/messages/${id}/read`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessages(messages.map(msg => msg._id === id ? { ...msg, isRead: true } : msg));
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    if (loading) return <div className="admin-loading">लोड हो रहा है...</div>;

    return (
        <div className="admin-content-wrapper">
            <div className="admin-header">
                <h2>📩 प्राप्त संदेश (Contact Form)</h2>
            </div>
            
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

            {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px' }}>
                    कोई नया संदेश नहीं है।
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {messages.map(msg => (
                        <div key={msg._id} style={{ 
                            background: 'white', 
                            borderRadius: '12px', 
                            padding: '24px', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            borderLeft: msg.isRead ? '4px solid #ccc' : '4px solid var(--primary)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: 'var(--navy)' }}>
                                        {msg.subject} {!msg.isRead && <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', verticalAlign: 'middle', marginLeft: '8px' }}>नया</span>}
                                    </h3>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
                                        <strong>👤 {msg.name}</strong> • 📅 {new Date(msg.createdAt).toLocaleString('hi-IN')}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {!msg.isRead && (
                                        <button onClick={() => markAsRead(msg._id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                                            पढ़ लिया (Mark Read)
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(msg._id)} className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                                        हटाएं (Delete)
                                    </button>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--navy)', background: '#f8f9fa', padding: '10px 15px', borderRadius: '8px' }}>
                                {msg.phone && <div><strong>📞 Phone:</strong> {msg.phone}</div>}
                                {msg.email && <div><strong>✉️ Email:</strong> <a href={`mailto:${msg.email}`}>{msg.email}</a></div>}
                            </div>
                            
                            <div style={{ 
                                padding: '15px', 
                                background: '#fdfdfd', 
                                border: '1px solid #eee', 
                                borderRadius: '8px',
                                whiteSpace: 'pre-wrap',
                                color: '#333',
                                lineHeight: '1.6'
                            }}>
                                {msg.message}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
