import ArticlePage from '../../../views/ArticlePage';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    try {
        const res = await fetch(`http://localhost:5000/api/articles/${slug}`);
        if (res.ok) {
            const article = await res.json();
            return {
                title: `${article.title} - JG News Plus`,
                description: article.excerpt || article.title,
                openGraph: {
                    title: article.title,
                    description: article.excerpt || article.title,
                    images: article.image ? [article.image] : [],
                }
            };
        }
    } catch(e) {
        console.error("Metadata fetch error", e);
    }
    return { title: 'Article Not Found' };
}

export default function Page() {
    return <ArticlePage />;
}