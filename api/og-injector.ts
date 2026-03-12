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

    let debugInfo = "";

    try {
        const supabaseUrl = process.env.VITE_SUPABASE_URL;
        // The user's Vercel settings show "VITE_SUPABASE_PUBLISHABLE_KEY"
        const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase configuration");
        }

        const apiRes = await fetch(
            `${supabaseUrl}/rest/v1/blog_posts?slug=eq.${slug}&select=title,excerpt,image_url`,
            {
                headers: {
                    "apikey": supabaseKey,
                    "Authorization": `Bearer ${supabaseKey}`,
                },
            }
        );

        if (!apiRes.ok) {
            throw new Error(`Supabase error: ${apiRes.status}`);
        }

        const posts = await apiRes.json();
        debugInfo = `Posts found: ${posts?.length}`;
        
        if (posts && posts.length > 0) {
            const post = posts[0];
            const title = `${post.title} | Penny Pal`;
            const description = post.excerpt || "Read this insight on Penny Pal.";
            const rawImage = post.image_url || "/logo.jpg";
            
            // Ensure image URL is absolute
            let finalImage = rawImage.startsWith('http') ? rawImage : `${url.origin}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
            
            // Optimization: Apply Cloudinary transformations if applicable
            if (finalImage.includes('cloudinary.com') && finalImage.includes('/upload/')) {
                finalImage = finalImage.replace('/upload/', '/upload/q_auto,f_auto,w_1200,h_630,c_fill/');
            }
            
            const postUrl = `${url.origin}/insights/${slug}`;

            // 🛡️ Bulletproof Strip & Inject
            // 1. Strip all existing potential conflicts (case-insensitive)
            html = html
                .replace(/<title>[\s\S]*?<\/title>/gi, '')
                .replace(/<meta[^>]*(?:name|property)=["'](?:description|og:|twitter:)[^>]*["'][^>]*\/?>/gi, '');

            // 2. Build the fresh metadata block
            const metaBlock = `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${postUrl}">
    <meta property="og:type" content="article">
    <meta property="og:image" content="${finalImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/jpeg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${finalImage}">
    <meta name="debug-slug" content="${slug}">
            `;

            // 3. Inject before </head> (resilient to case and spacing)
            html = html.replace(/<\/head>/i, `${metaBlock}\n</head>`);
        }
    } catch (e: any) {
        html = html.replace(/<\/head>/i, `<!-- OG Injection Error: ${e.message} ${debugInfo} -->\n</head>`);
    }

    return new Response(html, {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=86400", // Cache at the Edge for 24 hours
        },
    });
}
