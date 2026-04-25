import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
    try {
        const url = "https://hindi.news18.com/news/rajasthan/jaipur-rajasthan-bjp-loksabha-election-2024-cm-bhajanlal-sharma-target-congress-on-corruption-paper-leak-and-law-and-order-jaipur-news-8260655.html";
        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const ogImage = $('meta[property="og:image"]').attr('content');
        console.log("OG Image:", ogImage);
    } catch(e) { console.error(e.message); }
}
test();
