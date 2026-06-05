'use client';

import React from 'react';
import Link from 'next/link';


import { useLang } from '../context/LangContext';

function Section({ title, children }) {
    return (
        <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--navy)', marginBottom: '10px', borderLeft: '4px solid var(--teal)', paddingLeft: '12px' }}>{title}</h2>
            <div style={{ color: 'var(--gray-700)', lineHeight: 1.8, fontSize: '0.92rem' }}>{children}</div>
        </div>
    );
}

export default function Terms() {
    const { lang } = useLang();
    const isHi = lang === 'hi';

    return (
        <>
            
            <div className="container section-gap" style={{ maxWidth: '780px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                    <Link href="/" style={{ color: 'var(--teal)' }}>{isHi ? 'होम' : 'Home'}</Link>
                    <span>›</span>
                    <span style={{ fontWeight: 700 }}>{isHi ? 'नियम और शर्तें' : 'Terms & Conditions'}</span>
                </div>

                <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy)', marginBottom: '8px' }}>
                    {isHi ? '📋 नियम और शर्तें' : '📋 Terms & Conditions'}
                </h1>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginBottom: '36px' }}>
                    {isHi ? 'अंतिम अपडेट: जून 2026' : 'Last updated: June 2026'}
                </p>

                <Section title={isHi ? '1. स्वीकृति' : '1. Acceptance'}>
                    {isHi
                        ? 'JG News Plus (jgnews.live) की वेबसाइट का उपयोग करके आप इन नियम और शर्तों को स्वीकार करते हैं। यदि आप इन शर्तों से सहमत नहीं हैं तो कृपया इस वेबसाइट का उपयोग न करें।'
                        : 'By accessing and using JG News Plus (jgnews.live), you accept and agree to be bound by these Terms & Conditions. If you do not agree, please do not use this website.'}
                </Section>

                <Section title={isHi ? '2. सामग्री का उपयोग' : '2. Use of Content'}>
                    {isHi ? (
                        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>इस वेबसाइट पर प्रकाशित सभी समाचार, लेख, चित्र और वीडियो JG News Plus की बौद्धिक संपदा हैं।</li>
                            <li>व्यक्तिगत और गैर-व्यावसायिक उपयोग के लिए सामग्री पढ़ी जा सकती है।</li>
                            <li>बिना लिखित अनुमति के किसी भी सामग्री का पुनर्प्रकाशन, पुनर्वितरण या व्यावसायिक उपयोग वर्जित है।</li>
                            <li>सोशल मीडिया पर शेयर करते समय स्रोत का उल्लेख करना अनिवार्य है।</li>
                        </ul>
                    ) : (
                        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>All news, articles, images, and videos published on this website are the intellectual property of JG News Plus.</li>
                            <li>Content may be read for personal, non-commercial use only.</li>
                            <li>Republication, redistribution, or commercial use without written permission is strictly prohibited.</li>
                            <li>Mentioning the source is mandatory when sharing on social media.</li>
                        </ul>
                    )}
                </Section>

                <Section title={isHi ? '3. उपयोगकर्ता आचरण' : '3. User Conduct'}>
                    {isHi ? (
                        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>वेबसाइट का उपयोग किसी भी अवैध उद्देश्य के लिए नहीं किया जाएगा।</li>
                            <li>झूठी, भ्रामक या आपत्तिजनक जानकारी प्रसारित करना वर्जित है।</li>
                            <li>वेबसाइट की सुरक्षा को नुकसान पहुंचाने का कोई भी प्रयास कानूनी कार्रवाई का कारण बन सकता है।</li>
                        </ul>
                    ) : (
                        <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li>The website must not be used for any unlawful purpose.</li>
                            <li>Transmitting false, misleading, or offensive content is prohibited.</li>
                            <li>Any attempt to harm website security may result in legal action.</li>
                        </ul>
                    )}
                </Section>

                <Section title={isHi ? '4. समाचार सटीकता' : '4. News Accuracy'}>
                    {isHi
                        ? 'JG News Plus सटीक और निष्पक्ष समाचार प्रदान करने का प्रयास करता है। हालांकि हम सभी जानकारी की शत-प्रतिशत सटीकता की गारंटी नहीं देते। किसी भी त्रुटि की सूचना हमें manoj@jgnews.live पर दें।'
                        : 'JG News Plus strives to provide accurate and unbiased news. However, we do not guarantee 100% accuracy of all information. Please report any errors to manoj@jgnews.live.'}
                </Section>

                <Section title={isHi ? '5. तृतीय-पक्ष लिंक' : '5. Third-Party Links'}>
                    {isHi
                        ? 'इस वेबसाइट में अन्य वेबसाइटों के लिंक हो सकते हैं। JG News Plus उन वेबसाइटों की सामग्री या गोपनीयता नीतियों के लिए उत्तरदायी नहीं है।'
                        : 'This website may contain links to other websites. JG News Plus is not responsible for the content or privacy policies of those websites.'}
                </Section>

                <Section title={isHi ? '6. सेवा में परिवर्तन' : '6. Changes to Service'}>
                    {isHi
                        ? 'JG News Plus किसी भी समय बिना पूर्व सूचना के इन नियम और शर्तों को बदलने का अधिकार सुरक्षित रखता है। निरंतर उपयोग परिवर्तित शर्तों की स्वीकृति मानी जाएगी।'
                        : 'JG News Plus reserves the right to modify these terms at any time without prior notice. Continued use of the website constitutes acceptance of the modified terms.'}
                </Section>

                <Section title={isHi ? '7. संपर्क' : '7. Contact'}>
                    {isHi
                        ? <span>इन नियमों से संबंधित किसी भी प्रश्न के लिए <Link href="/contact" style={{ color: 'var(--teal)', fontWeight: 700 }}>हमसे संपर्क करें</Link> या manoj@jgnews.live पर लिखें।</span>
                        : <span>For any questions regarding these terms, <Link href="/contact" style={{ color: 'var(--teal)', fontWeight: 700 }}>contact us</Link> or write to manoj@jgnews.live.</span>
                    }
                </Section>

                <div style={{ background: 'rgba(0,188,212,0.07)', borderRadius: 'var(--radius-md)', padding: '20px', marginTop: '8px', textAlign: 'center' }}>
                    <Link href="/contact" className="btn btn-primary">{isHi ? '📞 हमसे संपर्क करें' : '📞 Contact Us'}</Link>
                    <span style={{ margin: '0 12px', color: 'var(--gray-400)' }}>|</span>
                    <Link href="/privacy" style={{ color: 'var(--teal)', fontWeight: 600, fontSize: '0.9rem' }}>{isHi ? 'गोपनीयता नीति' : 'Privacy Policy'} →</Link>
                </div>
            </div>
        </>
    );
}
