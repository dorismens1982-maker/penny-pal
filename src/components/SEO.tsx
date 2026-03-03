import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title: string;
    description?: string;
    image?: string;
    type?: string;
}

export const SEO = ({ title, description, image, type = 'website' }: SEOProps) => {
    const location = useLocation();

    useEffect(() => {
        // 1. Update Title
        const fullTitle = `${title} | Penny Pal`;
        document.title = fullTitle;

        // 2. Update Meta Description
        if (description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', description);
        }

        // 3. Update Open Graph Tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', fullTitle);

        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', `https://www.mypennypal.com${location.pathname}`);

        if (description) {
            const ogDesc = document.querySelector('meta[property="og:description"]');
            if (ogDesc) ogDesc.setAttribute('content', description);
        }

        if (image) {
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage) ogImage.setAttribute('content', image);
        }

        const ogType = document.querySelector('meta[property="og:type"]');
        if (ogType) ogType.setAttribute('content', type);

    }, [title, description, image, location.pathname, type]);

    return null;
};
