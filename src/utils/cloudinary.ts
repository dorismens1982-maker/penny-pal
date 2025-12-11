// Map of logical names to specific Cloudinary public IDs/URLs
const IMAGE_MAP: Record<string, string> = {
    // Vibes
    'vibe_transactions.png': 'https://res.cloudinary.com/dvyj0bgui/image/upload/v1765476496/vibe_transactions_wueel4.jpg',
    'vibe_goal.png': 'https://res.cloudinary.com/dvyj0bgui/image/upload/v1765476496/vibe_goal_vctixe.jpg',
    'vibe_insights.png': 'https://res.cloudinary.com/dvyj0bgui/image/upload/v1765476495/vibe_insights_kcj7uw.jpg',
    'vibe_freedom.png': 'https://res.cloudinary.com/dvyj0bgui/image/upload/v1765476495/vibe_freedom_jien2a.jpg',
    'vibe_analytics.png': 'https://res.cloudinary.com/dvyj0bgui/image/upload/v1765476494/vibe_analytics_kmfifa.jpg',
    'vibe_settings.png': 'https://res.cloudinary.com/dvyj0bgui/image/upload/v1765476494/vibe_settings_q7gkmg.jpg',
    'vibe_strategy.png': 'https://res.cloudinary.com/dvyj0bgui/image/upload/v1765476493/vibe_strategy_ymghxt.jpg',
    'vibe_growth.png': 'https://res.cloudinary.com/dvyj0bgui/image/upload/v1765476493/vibe_growth_cmgttg.jpg',
};

export const getCloudinaryUrl = (filename: string) => {
    // Remove leading slash if present to match keys
    const cleanFilename = filename.startsWith('/') ? filename.slice(1) : filename;

    const mappedUrl = IMAGE_MAP[cleanFilename];

    if (mappedUrl) {
        // Inject f_auto,q_auto for optimization
        // The URL format is .../upload/v.../...
        // We want .../upload/f_auto,q_auto/v.../...
        return mappedUrl.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    // Fallback for unknown files (try standard naming as a backup)
    return `https://res.cloudinary.com/dvyj0bgui/image/upload/f_auto,q_auto/penny-pal/${cleanFilename}`;
};
