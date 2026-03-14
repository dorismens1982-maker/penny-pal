import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
    type?: string;
    canonicalUrl?: string;
    author?: string;
    datePublished?: string;
    dateModified?: string;
}

export const SEO = ({ 
    title, 
    description, 
    image, 
    type = 'website',
    canonicalUrl,
    author,
    datePublished,
    dateModified
}: SEOProps) => {
    const location = useLocation();

    useEffect(() => {
        // 1. Update Title
        const fullTitle = `${title} | Penny Pal`;
        document.title = fullTitle;

        // Utility to get or create meta tag
        const getOrCreateMeta = (selector: string, attr: string, value: string, contentAttr: string = 'content') => {
            let el = document.querySelector(selector);
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attr, value);
                document.head.appendChild(el);
            }
            return el;
        };

        // Utility to get or create link tag
        const getOrCreateLink = (selector: string, rel: string, href: string) => {
            let el = document.querySelector(selector);
            if (!el) {
                el = document.createElement('link');
                el.setAttribute('rel', rel);
                document.head.appendChild(el);
            }
            return el;
        };

        // 2. Update Meta Description
        if (description) {
            const metaDesc = getOrCreateMeta('meta[name="description"]', 'name', 'description');
            metaDesc.setAttribute('content', description);
        }

        // 3. Update Canonical Link
        const finalCanonical = canonicalUrl || `https://www.mypennypal.com${location.pathname}`;
        const canonicalTag = getOrCreateLink('link[rel="canonical"]', 'canonical', finalCanonical);
        canonicalTag.setAttribute('href', finalCanonical);

        // 4. Update Open Graph Tags
        const ogTitle = getOrCreateMeta('meta[property="og:title"]', 'property', 'og:title');
        ogTitle.setAttribute('content', fullTitle);

        const ogUrl = getOrCreateMeta('meta[property="og:url"]', 'property', 'og:url');
        ogUrl.setAttribute('content', finalCanonical);

        if (description) {
            const ogDesc = getOrCreateMeta('meta[property="og:description"]', 'property', 'og:description');
            ogDesc.setAttribute('content', description);
        }

        const sharingImage = image || 'https://www.mypennypal.com/logo.jpg';
        const ogImage = getOrCreateMeta('meta[property="og:image"]', 'property', 'og:image');
        ogImage.setAttribute('content', sharingImage);

        const twitterImage = getOrCreateMeta('meta[name="twitter:image"]', 'name', 'twitter:image');
        twitterImage.setAttribute('content', sharingImage);

        // Update dimensions
        const ogWidth = getOrCreateMeta('meta[property="og:image:width"]', 'property', 'og:image:width');
        ogWidth.setAttribute('content', '1200');
        const ogHeight = getOrCreateMeta('meta[property="og:image:height"]', 'property', 'og:image:height');
        ogHeight.setAttribute('content', '630');

        const ogType = getOrCreateMeta('meta[property="og:type"]', 'property', 'og:type');
        ogType.setAttribute('content', type);

        // Twitter Card
        const twitterCard = getOrCreateMeta('meta[name="twitter:card"]', 'name', 'twitter:card');
        twitterCard.setAttribute('content', 'summary_large_image');

        const twitterTitle = getOrCreateMeta('name', 'twitter:title', fullTitle); // Wait, this was bugged in previous version
        const realTwitterTitle = getOrCreateMeta('meta[name="twitter:title"]', 'name', 'twitter:title');
        realTwitterTitle.setAttribute('content', fullTitle);

        if (description) {
            const twitterDesc = getOrCreateMeta('meta[name="twitter:description"]', 'name', 'twitter:description');
            twitterDesc.setAttribute('content', description);
        }

        // 5. JSON-LD Structured Data
        if (type === 'article') {
            const jsonLd = {
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                "headline": title,
                "image": [sharingImage],
                "datePublished": datePublished || new Date().toISOString(),
                "dateModified": dateModified || datePublished || new Date().toISOString(),
                "author": [{
                    "@type": "Person",
                    "name": author || "Penny Pal Team",
                    "url": "https://www.mypennypal.com/insights"
                }],
                "publisher": {
                    "@type": "Organization",
                    "name": "Penny Pal",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://www.mypennypal.com/logo.jpg"
                    }
                },
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": finalCanonical
                }
            };

            let script = document.querySelector('script[type="application/ld+json"]');
            if (!script) {
                script = document.createElement('script');
                script.setAttribute('type', 'application/ld+json');
                document.head.appendChild(script);
            }
            script.textContent = JSON.stringify(jsonLd);
        } else {
            // Remove JSON-LD if not an article (to avoid stale data)
            const script = document.querySelector('script[type="application/ld+json"]');
            if (script) script.remove();
        }

    }, [title, description, image, location.pathname, type, canonicalUrl, author, datePublished, dateModified]);

    return null;
};
