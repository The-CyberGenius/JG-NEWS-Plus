import axios from 'axios';
import { extractFromHtml } from '@extractus/article-extractor';

async function test() {
    const url = "https://hindi.news18.com/news/rajasthan/jaipur-rajasthan-bjp-loksabha-election-2024-cm-bhajanlal-sharma-target-congress-on-corruption-paper-leak-and-law-and-order-jaipur-news-8260655.html";
    console.log("Fetching:", url);
    const { data: html, request } = await axios.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });
    console.log("Final URL:", request.res.responseUrl);
    const result = await extractFromHtml(html, request.res.responseUrl || url);
    console.log("Result:", result ? { title: result.title, image: result.image } : "null");
}
test();
