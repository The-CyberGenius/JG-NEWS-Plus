import axios from 'axios';

async function test() {
    try {
        const url = "https://news.google.com/rss/articles/CBMigAJBVV95cUxQWk5WV2NGWEEwMjdRQ2E1bnFjVFVnTU9kQVRCX1NXV2QyOEpmVDdwUzJ1eHN2RzF1TjktTU5RSGw0MWJCVWwteVRSQW9mRzFwaC04Uk1zaXFMYVN5NV8zLUJic3o3djhGeTNBQjh6aGFEM3ZmOXV3aGxjM01BYlZ5ZlprXzM0V0l3TF9yNnF0RDkyQWtOTlBhQk96UVJOV1ZPcUxLS0h6SEJuZE1Nd0dZb2NSNW53dEVNd1NsSzc0bGRiM0pLU0JmNjBYNmlnVmV5UnEtTU1pbUVhVXpNVUZ2azc1cUlWMjBERXg5QmFzc0ptOWpBYVBMLTdRM3VNbDJv0gGIAkFVX3lxTE9vb0xCTU1iUmJPb1p0cndibGlLTERsZUw5TU9Pd0NHUkg1cHdyaDBORng4Z0c2N1pWTW9JbzdqR05BMjNCdnNzbWVXamdLVGxkeDBua01JZTNiMG9XQnlTZWZCUFpJSkoySHYtNDFjZ3BzdXRjYTEtYWhQdklZQ3l0a1pMcGQ1Yk51eW14Vk5IaXlyNG83WnRRUkQxVDZ6QkZkblB6M2JxS0Z3aTB1NkpBQVJlZ2hjYXlzdVV4NDgzbWFhc0F3emVtN0pLelE2X0tzSHdaai1wQzJjU1YweHk4TTNTcDNXS2o3bmdOdWR6cmxhdFBTYWJybzRDQTd0a0VjeDJLYjZVVw?oc=5";
        const res = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' },
            maxRedirects: 5
        });
        console.log("Final URL:", res.request.res.responseUrl);
    } catch(e) {
        console.log("Error:", e.message);
    }
}
test();
