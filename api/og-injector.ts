import { getBlogPost } from "./shared/blogData.js";

export const config = {
    runtime: "edge",
};

export default async function handler(request: Request) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(Boolean);

    // We only care about /insights/[slug]
    if (pathParts[0] !== "insights" || !pathParts[1]) {
        // Fallback pass-through if something routes here incorrectly
        return fetch(new URL("/", request.url));
    }

    const slug = pathParts[1];
    const post = getBlogPost(slug);

    // Fetch the actual index.html that Vite built.
    // We use the origin so it works in both dev (localhost) and prod (Vercel)
    const indexUrl = new URL("/index.html", request.url);
    const response = await fetch(indexUrl);
    let html = await response.text();

    if (post) {
        // Replace the default meta tags with the post-specific ones
        const title = `${post.title} | Penny Pal`;
        const description = post.excerpt;
        const image = post.image || "https://www.mypennypal.com/logo.png";
        const postUrl = `https://www.mypennypal.com/insights/${slug}`;

        html = html
            .replace(
                /<title>.*?<\/title>/,
                `<title>${title}</title>`
            )
            .replace(
                /<meta name="description" content=".*?"\/>|<meta name="description"\s+content=".*?"\s*>/,
                `<meta name="description" content="${description}">`
            )
            .replace(
                /<meta property="og:title" content=".*?" \/>|<meta property="og:title"\s+content=".*?"\s*>/,
                `<meta property="og:title" content="${title}">`
            )
            .replace(
                /<meta property="og:description"[\s\n]*content=".*?" \/>|<meta property="og:description"\s+content=".*?"\s*>/,
                `<meta property="og:description" content="${description}">`
            )
            .replace(
                /<meta property="og:image" content=".*?" \/>|<meta property="og:image"\s+content=".*?"\s*>/,
                `<meta property="og:image" content="${image}">`
            )
            .replace(
                /<meta property="og:url" content=".*?" \/>|<meta property="og:url"\s+content=".*?"\s*>/,
                `<meta property="og:url" content="${postUrl}">`
            )
            .replace(
                /<meta name="twitter:title" content=".*?" \/>|<meta name="twitter:title"\s+content=".*?"\s*>/,
                `<meta name="twitter:title" content="${title}">`
            )
            .replace(
                /<meta name="twitter:description"[\s\n]*content=".*?" \/>|<meta name="twitter:description"\s+content=".*?"\s*>/,
                `<meta name="twitter:description" content="${description}">`
            )
            .replace(
                /<meta name="twitter:image" content=".*?" \/>|<meta name="twitter:image"\s+content=".*?"\s*>/,
                `<meta name="twitter:image" content="${image}">`
            );
    }

    return new Response(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=86400", // Cache at the Edge for 24 hours
        },
    });
}
