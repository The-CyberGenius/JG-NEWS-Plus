import axios from 'axios';

async function test() {
    try {
        const url = "https://hindi.news18.com/news/rajasthan/jaipur-rajasthan-bjp-loksabha-election-2024-cm-bhajanlal-sharma-target-congress-on-corruption-paper-leak-and-law-and-order-jaipur-news-8260655.html";
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000
        });
        const ogImageMatch = data.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>|<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
        const ogImage = ogImageMatch ? (ogImageMatch[1] || ogImageMatch[2]) : '';
        console.log("Extracted OG Image:", ogImage);
    } catch(e) { console.error(e.message); }
}
test();
