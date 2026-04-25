import { extract } from '@extractus/article-extractor';

async function test() {
    const url = "https://news.google.com/rss/articles/CBMiJmh0dHBzOi8vd3d3LmJkYy10di5jb20vbmV3cy9kZXRhaWwuaHRtbNIBAA?oc=5";
    console.log("Fetching:", url);
    const result = await extract(url);
    console.log("Result:", result ? { title: result.title, image: result.image } : "null");
}
test();
