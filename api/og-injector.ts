export const config = {
    runtime: "edge",
};

export default async function handler(request: Request) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    
    // Prioritize slug from query param (passed by vercel.json rewrite)
    let slug = url.searchParams.get("slug");
    
    // Fallback to path parts if query param is missing
    if (!slug) {
        if (pathParts[0] === "insights" && pathParts[1]) {
            slug = pathParts[1];
        }
    }

    if (!slug) {
        console.warn(`Could not determine slug for URL: ${url.href}`);
        // Fallback pass-through
        return fetch(new URL("/", request.url));
    }

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
                console.log(`Supabase found ${posts?.length} posts for slug: ${slug}`);
                
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
                    
                    console.log(`Injecting image for "${post.title}": ${optimizedImage}`);

                    // Use a more robust attribute-agnostic regex
                    const replaceMeta = (html: string, identifier: string, content: string, extraTags: string = "") => {
                        // Regex pattern to match meta tag with specific attribute (name or property)
                        // It matches even if content/name order is swapped
                        const pattern = new RegExp(`<meta[^>]*(?:name|property)=["']${identifier}["'][^>]*>`, "gi");
                        return html.replace(pattern, `<meta property="${identifier.startsWith('og:') ? identifier : identifier}" content="${content}">` + (extraTags ? "\n    " + extraTags : ""));
                    };

                    html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
                    html = replaceMeta(html, "description", description);
                    html = replaceMeta(html, "og:title", title);
                    html = replaceMeta(html, "og:description", description);
                    html = replaceMeta(html, "og:url", postUrl);
                    html = replaceMeta(html, "twitter:title", title);
                    html = replaceMeta(html, "twitter:description", description);
                    
                    // Specialized handling for image to add dimensions
                    const imageDimensions = `<meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">\n    <meta property="og:image:type" content="image/jpeg">`;
                    html = replaceMeta(html, "og:image", optimizedImage, imageDimensions);
                    html = replaceMeta(html, "twitter:image", optimizedImage);
                    
                    console.log("Meta tags successfully injected.");
                } else {
                    console.warn(`No post found in DB for slug: ${slug}`);
                }
            } else {
                console.error(`Supabase API error: ${apiRes.status} ${apiRes.statusText}`);
            }
        } else {
            console.error("Missing Supabase environment variables in Edge function");
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
