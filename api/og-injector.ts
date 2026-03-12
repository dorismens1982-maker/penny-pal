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

    // Fetch the actual index.html that Vite built.
    // We use the origin so it works in both dev (localhost) and prod (Vercel)
    const indexUrl = new URL("/index.html", request.url);
    const response = await fetch(indexUrl);
    let html = await response.text();

    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseAnonKey) {
            // Fetch directly from Supabase REST API to avoid edge runtime issues with heavy SDKs
            const apiRes = await fetch(
                `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${slug}&select=title,excerpt,image_url`,
                {
                    headers: {
                        "apikey": supabaseAnonKey,
                        "Authorization": `Bearer ${supabaseAnonKey}`,
                    },
                }
            );

            if (apiRes.ok) {
                const posts = await apiRes.json();
                if (posts && posts.length > 0) {
                    const post = posts[0];
                    const title = `${post.title} | Penny Pal`;
                    const description = post.excerpt || "Read this insight on Penny Pal.";
                    const rawImage = post.image_url || "https://www.mypennypal.com/logo.jpg";
                    const postUrl = `${url.origin}/insights/${slug}`;
                    
                    // Optimization: If it's a Cloudinary URL, ensure it has optimized parameters for social sharing
                    let optimizedImage = rawImage;
                    if (optimizedImage.includes('cloudinary.com') && optimizedImage.includes('/upload/')) {
                        optimizedImage = optimizedImage.replace('/upload/', '/upload/q_auto,f_auto,w_1200,h_630,c_fill/');
                    }

                    // Improved Regex to be more resilient to spaces and self-closing tags
                    html = html
                        .replace(
                            /<title>.*?<\/title>/,
                            `<title>${title}</title>`
                        )
                        .replace(
                            /<meta name="description"[\s\n]*content=".*?"[\s]*\/?>|<meta property="og:description"[\s\n]*content=".*?"[\s]*\/?>/g,
                            (match) => match.includes('og:description') 
                                ? `<meta property="og:description" content="${description}">`
                                : `<meta name="description" content="${description}">`
                        )
                        .replace(
                            /<meta property="og:title"[\s\n]*content=".*?"[\s]*\/?>/g,
                            `<meta property="og:title" content="${title}">`
                        )
                        .replace(
                            /<meta property="og:image"[\s\n]*content=".*?"[\s]*\/?>/g,
                            `<meta property="og:image" content="${optimizedImage}">\n    <meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">\n    <meta property="og:image:type" content="image/jpeg">`
                        )
                        .replace(
                            /<meta property="og:url"[\s\n]*content=".*?"[\s]*\/?>/g,
                            `<meta property="og:url" content="${postUrl}">`
                        )
                        .replace(
                            /<meta name="twitter:title"[\s\n]*content=".*?"[\s]*\/?>/g,
                            `<meta name="twitter:title" content="${title}">`
                        )
                        .replace(
                            /<meta name="twitter:description"[\s\n]*content=".*?"[\s]*\/?>/g,
                            `<meta name="twitter:description" content="${description}">`
                        )
                        .replace(
                            /<meta name="twitter:image"[\s\n]*content=".*?"[\s]*\/?>/g,
                            `<meta name="twitter:image" content="${optimizedImage}">`
                        );
                }
            }
        }
    } catch (e) {
        console.error("Failed to inject OG tags from Supabase", e);
    }

    return new Response(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=86400", // Cache at the Edge for 24 hours
        },
    });
}
