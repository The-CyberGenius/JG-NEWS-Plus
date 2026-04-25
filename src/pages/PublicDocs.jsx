import React from 'react';

export default function PublicDocs() {
    const docs = [
        {
            title: 'सम्पूर्ण विकास और तकनीकी रिपोर्ट',
            desc: 'JG-NEWS-Plus के सभी फीचर्स, आर्किटेक्चर और एडमिन पैनल की पूरी जानकारी (Hindi).',
            url: '/inforeport.html',
            icon: '📄'
        },
        {
            title: 'Developer Quotation',
            desc: 'प्रोजेक्ट की तकनीकी आवश्यकताएं, स्कोप और कमर्शियल कोटेशन.',
            url: '/JG_News_Developer_Quotation.html',
            icon: '💼'
        },
        {
            title: 'User Guide',
            desc: 'वेबसाइट और एडमिन पैनल को इस्तेमाल करने का पूरा तरीका (User Manual).',
            url: '/JG_News_User_Guide.html',
            icon: '📖'
        }
    ];

    return (
        <div className="container section-gap">
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '8px', textAlign: 'center' }}>
                📂 सार्वजनिक दस्तावेज़ (Public Documents)
            </h1>
            <p style={{ color: 'var(--gray-600)', marginBottom: '40px', textAlign: 'center' }}>
                कृपया नीचे दिए गए किसी भी दस्तावेज़ पर क्लिक करके उसे पढ़ें या डाउनलोड करें।
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                {docs.map((doc, i) => (
                    <a 
                        key={i} 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                            background: 'white',
                            padding: '30px',
                            borderRadius: '12px',
                            boxShadow: 'var(--card-shadow)',
                            textDecoration: 'none',
                            color: 'inherit',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            borderTop: '4px solid var(--teal)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--card-shadow)';
                        }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{doc.icon}</div>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--navy)', fontWeight: 800, marginBottom: '10px' }}>{doc.title}</h2>
                        <p style={{ fontSize: '0.95rem', color: 'var(--gray-600)', lineHeight: '1.5' }}>{doc.desc}</p>
                        
                        <div style={{ marginTop: '20px', color: 'var(--teal)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            देखें <span style={{ fontSize: '1.2rem' }}>→</span>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
