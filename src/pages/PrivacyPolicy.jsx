import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '10px', borderLeft: '4px solid var(--teal)', paddingLeft: '12px' }}>{title}</h2>
            <div style={{ color: 'var(--gray-700)', lineHeight: 1.8, fontSize: '0.92rem' }}>{children}</div>
        </div>
    );
}

export default function PrivacyPolicy() {
    const { lang } = useLang();
    const isHi = lang === 'hi';

    return (
        <>
            <Helmet>
                <title>{isHi ? 'गोपनीयता नीति | JG News Plus' : 'Privacy Policy | JG News Plus'}</title>
            </Helmet>
            <div className="container section-gap" style={{ maxWidth: '780px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                    <Link to="/" style={{ color: 'var(--teal)' }}>{isHi ? 'होम' : 'Home'}</Link>
                    <span>›</span>
                    <span style={{ fontWeight: 700 }}>{isHi ? 'गोपनीयता नीति' : 'Privacy Policy'}</span>
                </div>

                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '8px' }}>
                    {isHi ? '🔒 गोपनीयता नीति' : '🔒 Privacy Policy'}
                </h1>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: '36px' }}>
                    {isHi ? 'अंतिम अपडेट: जून 2026' : 'Last updated: June 2026'}
                </p>

                <Section title={isHi ? '1. परिचय' : '1. Introduction'}>
                    {isHi
                        ? 'JG News Plus आपकी गोपनीयता को गंभीरता से लेता है। यह नीति बताती है कि हम कौन सी जानकारी एकत्र करते हैं, उसका उपयोग कैसे करते हैं, और आपके अधिकार क्या हैं।'
                        : 'JG News Plus takes your privacy seriously. This policy explains what information we collect, how we use it, and your rights regarding your data.'}
                </Section>

                <Section title={isHi ? '2. एकत्र की जाने वाली जानकारी' : '2. Information We Collect'}>
                    {isHi ? (
                        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li><strong>संपर्क फ़ॉर्म:</strong> नाम, ईमेल, फ़ोन नंबर और संदेश।</li>
                            <li><strong>न्यूज़लेटर सब्सक्रिप्शन:</strong> ईमेल पता।</li>
                            <li><strong>उपयोग डेटा:</strong> पेज व्यू, क्लिक, ब्राउज़र प्रकार (analytics के लिए)।</li>
                            <li><strong>कुकीज़:</strong> सेशन प्रबंधन और प्राथमिकताओं के लिए।</li>
                        </ul>
                    ) : (
                        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li><strong>Contact Form:</strong> Name, email, phone number, and message.</li>
                            <li><strong>Newsletter:</strong> Email address.</li>
                            <li><strong>Usage Data:</strong> Page views, clicks, browser type (for analytics).</li>
                            <li><strong>Cookies:</strong> For session management and preferences.</li>
                        </ul>
                    )}
                </Section>

                <Section title={isHi ? '3. जानकारी का उपयोग' : '3. Use of Information'}>
                    {isHi ? (
                        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>संपर्क करने पर उत्तर देने के लिए।</li>
                            <li>न्यूज़लेटर और अपडेट भेजने के लिए (सब्सक्राइब करने पर)।</li>
                            <li>वेबसाइट की गुणवत्ता सुधारने के लिए।</li>
                            <li>हम आपकी जानकारी तृतीय पक्षों को नहीं बेचते।</li>
                        </ul>
                    ) : (
                        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>To respond to your contact inquiries.</li>
                            <li>To send newsletters and updates (if subscribed).</li>
                            <li>To improve website quality and performance.</li>
                            <li>We do not sell your information to third parties.</li>
                        </ul>
                    )}
                </Section>

                <Section title={isHi ? '4. कुकीज़' : '4. Cookies'}>
                    {isHi
                        ? 'हम सेशन प्रबंधन और भाषा प्राथमिकता के लिए कुकीज़ का उपयोग करते हैं। आप अपने ब्राउज़र सेटिंग्स में कुकीज़ को अक्षम कर सकते हैं, हालांकि इससे कुछ सुविधाएं प्रभावित हो सकती हैं।'
                        : 'We use cookies for session management and language preferences. You can disable cookies in your browser settings, though this may affect some features.'}
                </Section>

                <Section title={isHi ? '5. डेटा सुरक्षा' : '5. Data Security'}>
                    {isHi
                        ? 'हम आपके डेटा की सुरक्षा के लिए उद्योग-मानक तकनीकों (HTTPS, JWT authentication, encrypted storage) का उपयोग करते हैं। हालांकि इंटरनेट पर 100% सुरक्षा की गारंटी देना संभव नहीं है।'
                        : 'We use industry-standard technologies (HTTPS, JWT authentication, encrypted storage) to protect your data. However, 100% security on the internet cannot be guaranteed.'}
                </Section>

                <Section title={isHi ? '6. तृतीय-पक्ष सेवाएं' : '6. Third-Party Services'}>
                    {isHi
                        ? 'हम Vercel Analytics (उपयोग आंकड़े) और Cloudinary (मीडिया स्टोरेज) का उपयोग करते हैं। इन सेवाओं की अपनी गोपनीयता नीतियां हैं।'
                        : 'We use Vercel Analytics (usage statistics) and Cloudinary (media storage). These services have their own privacy policies.'}
                </Section>

                <Section title={isHi ? '7. आपके अधिकार' : '7. Your Rights'}>
                    {isHi ? (
                        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>अपना डेटा देखने का अधिकार।</li>
                            <li>डेटा सुधार का अधिकार।</li>
                            <li>डेटा हटाने का अनुरोध करने का अधिकार।</li>
                            <li>न्यूज़लेटर अनसब्सक्राइब का अधिकार।</li>
                        </ul>
                    ) : (
                        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>Right to access your data.</li>
                            <li>Right to correct your data.</li>
                            <li>Right to request data deletion.</li>
                            <li>Right to unsubscribe from newsletters.</li>
                        </ul>
                    )}
                </Section>

                <Section title={isHi ? '8. संपर्क' : '8. Contact'}>
                    {isHi
                        ? <span>गोपनीयता से संबंधित किसी भी प्रश्न के लिए <Link to="/contact" style={{ color: 'var(--teal)', fontWeight: 700 }}>हमसे संपर्क करें</Link> या manoj@jgnews.live पर लिखें।</span>
                        : <span>For any privacy-related questions, <Link to="/contact" style={{ color: 'var(--teal)', fontWeight: 700 }}>contact us</Link> or write to manoj@jgnews.live.</span>
                    }
                </Section>

                <div style={{ background: 'rgba(0,188,212,0.07)', borderRadius: 'var(--radius-md)', padding: '20px', marginTop: '8px', textAlign: 'center' }}>
                    <Link to="/contact" className="btn btn-primary">{isHi ? '📞 हमसे संपर्क करें' : '📞 Contact Us'}</Link>
                    <span style={{ margin: '0 12px', color: 'var(--gray-400)' }}>|</span>
                    <Link to="/terms" style={{ color: 'var(--teal)', fontWeight: 600, fontSize: '0.9rem' }}>{isHi ? 'नियम और शर्तें' : 'Terms & Conditions'} →</Link>
                </div>
            </div>
        </>
    );
}
