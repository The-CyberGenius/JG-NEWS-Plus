import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'media'],
            ['enclosure', 'media'],
            ['content:encoded', 'contentEncoded']
        ],
    }
});

async function test() {
    try {
        const data = await parser.parseURL('https://news.google.com/rss/search?q=Rajasthan+News&hl=hi&gl=IN&ceid=IN:hi');
        console.log("Google News 1st item:", data.items[0]);
    } catch(e) { console.error(e); }
    try {
        const data2 = await parser.parseURL('https://www.amarujala.com/rss/rajasthan.xml');
        console.log("Amar Ujala 1st item:", data2.items[0]);
    } catch(e) { console.error(e); }
}
test();
