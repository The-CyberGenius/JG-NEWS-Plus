import axios from 'axios';

async function test() {
    try {
        const url = "https://www.amarujala.com/video/rajasthan/rajasthan-news-21-members-including-merchant-navy-officer-of-rajasthan-trapped-amar-ujala-rajasthan-2026-04-25";
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)' }, timeout: 8000
        });
        const ogImageMatch = data.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>|<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
        const ogImage = ogImageMatch ? (ogImageMatch[1] || ogImageMatch[2]) : '';
        console.log("Extracted OG Image:", ogImage);
    } catch(e) { console.error(e.message); }
}
test();
