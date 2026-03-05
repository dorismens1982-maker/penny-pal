export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    date: string;
    readTime: number;
    image?: string;
    featured?: boolean;
}

export const blogPosts: BlogPost[] = [
    {
        id: '1',
        slug: 'track-daily-expenses',
        title: '5 Simple Ways to Track Your Daily Expenses',
        excerpt: 'Master the art of expense tracking with these practical tips that will help you stay on top of your finances.',
        category: 'Expense Tracking',
        date: '2025-09-28',
        readTime: 5,
        featured: true,
        image: 'https://images.unsplash.com/photo-1658677414428-d0ae187034cc?q=80&w=1200&fit=crop',
        content: ''
    },
    {
        id: '2',
        slug: 'cedi-usd-savings',
        title: 'Understanding CEDI vs USD: What It Means for Your Savings',
        excerpt: 'Learn how currency fluctuations between the Ghana Cedi and US Dollar impact your savings and what you can do about it.',
        category: 'Currency Updates',
        date: '2025-09-25',
        readTime: 7,
        image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?q=80&w=1200&fit=crop&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8',
        content: ''
    },
    {
        id: '3',
        slug: 'first-emergency-fund',
        title: 'Building Your First Emergency Fund',
        excerpt: 'A step-by-step guide to creating a financial safety net that will protect you from unexpected expenses.',
        category: 'Saving Tips',
        date: '2025-09-20',
        readTime: 6,
        featured: true,
        image: 'https://images.unsplash.com/photo-1633158829556-6ea20ad39b4f?q=80&w=1200&fit=crop',
        content: ''
    },
    {
        id: '4',
        slug: 'smart-investments-ghana',
        title: 'Smart Investment Options for Beginners in Ghana',
        excerpt: 'Explore safe and profitable investment opportunities available to Ghanaians looking to grow their wealth.',
        category: 'Investment Guide',
        date: '2025-09-15',
        readTime: 8,
        featured: true,
        image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=1200&fit=crop',
        content: ''
    }
];

export const getBlogPost = (slug: string): BlogPost | undefined => {
    return blogPosts.find((post) => post.slug === slug);
};
