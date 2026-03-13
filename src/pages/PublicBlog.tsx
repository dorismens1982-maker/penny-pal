import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import type { BlogPost } from '@/types/blog';
import { APP_NAME } from '@/config/app';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, ArrowRight, ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getOptimizedImageUrl } from '@/lib/utils';
import { SEO } from '@/components/SEO';

const CATEGORIES = ['All', 'Saving Tips', 'Investment Guide', 'Currency Updates', 'Expense Tracking'];

const categoryColors: Record<string, string> = {
    'Saving Tips': 'bg-green-500/10 text-green-700 border-green-500/20',
    'Investment Guide': 'bg-primary/10 text-primary border-primary/20',
    'Currency Updates': 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    'Expense Tracking': 'bg-purple-500/10 text-purple-700 border-purple-500/20',
};

const PublicBlog = () => {
    const navigate = useNavigate();
    const { posts: allPosts, loading } = useBlogPosts();
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState('');

    // Non-admins only see published posts
    const blogPosts = allPosts.filter(p => p.published);

    const filtered = blogPosts.filter(p => {
        const matchCat = category === 'All' || p.category === category;
        const matchSearch = search === '' ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            (p.excerpt && p.excerpt.toLowerCase().includes(search.toLowerCase()));
        return matchCat && matchSearch;
    });

    const featured = filtered[0];
    const rest = filtered.slice(1);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <SEO 
                title={`${APP_NAME} Blog - Financial Insights for Ghana`}
                description="Expert financial tips, saving strategies, and investment guides tailored for the Ghanaian market."
            />
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1.5" type="button">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Home</span>
                        </Button>
                        <div className="h-4 w-px bg-border" />
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
                            </div>
                            <span className="font-bold text-lg tracking-tight hidden sm:block">{APP_NAME}</span>
                        </Link>
                    </div>
                    <Button size="sm" onClick={() => navigate('/')} type="button">Get Started</Button>
                </div>
            </nav>

            {/* Hero */}
            <section className="py-14 md:py-20 bg-gradient-to-br from-background via-background/95 to-primary/5 border-b border-border/30 relative overflow-hidden">
                <div className="absolute top-10 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl -z-10" />
                <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center space-y-5">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary/80 bg-primary/10 px-3 py-1 rounded-full">
                        Financial Education
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-merriweather">
                        The <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{APP_NAME}</span> Blog
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Practical tips, savings strategies, and financial insights tailored for Ghana.
                    </p>

                    {/* Search */}
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search articles..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 h-12 rounded-xl"
                        />
                    </div>
                </div>
            </section>

            {/* Category Filter */}
            <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border/40 py-3">
                <div className="container px-4 md:px-6 flex flex-wrap gap-2 justify-center">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${category === cat
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                    : 'bg-muted/50 text-muted-foreground border-border/40 hover:border-primary/40 hover:text-foreground'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-1 container px-4 md:px-6 max-w-5xl mx-auto py-12 space-y-12">

                {/* Featured Article */}
                {featured && (
                    <div
                        className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-border/50 hover:border-primary/40 hover:shadow-xl transition-all duration-300"
                        onClick={() => navigate(`/insights/${featured.slug}`)}
                    >
                        {featured.image_url && (
                            <div className="h-64 md:h-80 overflow-hidden">
                                <img
                                    src={getOptimizedImageUrl(featured.image_url, 1200)}
                                    alt={featured.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        )}
                        <div className="p-6 md:p-8 space-y-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${categoryColors[featured.category || ''] || 'bg-muted text-muted-foreground border-border'}`}>
                                    {featured.category}
                                </span>
                                <span className="text-xs text-primary font-semibold uppercase tracking-wider">Featured</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold group-hover:text-primary transition-colors font-merriweather">{featured.title}</h2>
                            <p className="text-muted-foreground leading-relaxed line-clamp-2">{featured.excerpt}</p>
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(featured.published_at || featured.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featured.read_time || '5'} min read</span>
                                </div>
                                <span className="flex items-center gap-1.5 text-sm text-primary font-medium group-hover:gap-3 transition-all">
                                    Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rest of posts */}
                {rest.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {rest.map((post: BlogPost) => (
                            <div
                                key={post.id}
                                className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
                                onClick={() => navigate(`/insights/${post.slug}`)}
                            >
                                {post.image_url && (
                                    <div className="h-44 overflow-hidden">
                                        <img src={getOptimizedImageUrl(post.image_url, 800)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                )}
                                <div className="p-5 space-y-3 flex-1 flex flex-col">
                                    <span className={`self-start px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${categoryColors[post.category || ''] || 'bg-muted text-muted-foreground border-border'}`}>
                                        {post.category}
                                    </span>
                                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors leading-snug line-clamp-2 font-merriweather">{post.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-3">{post.excerpt}</p>
                                    <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.read_time || '5'} min</span>
                                        <span className="flex items-center gap-1 text-primary font-medium">
                                            Read <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filtered.length === 0 && (
                    <div className="text-center py-20 space-y-3">
                        <p className="text-4xl">📭</p>
                        <p className="text-muted-foreground text-lg">No articles found.</p>
                        <Button variant="outline" onClick={() => { setCategory('All'); setSearch(''); }} type="button">Clear filters</Button>
                    </div>
                )}
            </main>

            <LandingFooter />
        </div>
    );
};

export default PublicBlog;

