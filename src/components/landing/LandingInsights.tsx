import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { BlogPost } from '@/types/blog';
import { ArrowRight, BookOpen } from 'lucide-react';

export const LandingInsights = () => {
    const { fetchPublishedPosts, posts, loading } = useBlogPosts();
    const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);

    useEffect(() => {
        fetchPublishedPosts();
    }, []);

    useEffect(() => {
        if (posts && posts.length > 0) {
            // Only show published posts, even if an admin is viewing the landing page
            const published = posts.filter((p) => p.published);
            setRecentPosts(published.slice(0, 3));
        }
    }, [posts]);

    if (loading || recentPosts.length === 0) {
        return null; // Don't show the section if it's loading or empty to prevent layout shift jumping
    }

    return (
        <section className="py-20 md:py-28 bg-muted/20 relative border-t border-border/50">
            <div className="container px-4 md:px-6 space-y-12">

                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-5xl mx-auto">
                    <div className="space-y-3">
                        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/80 bg-primary/10 px-3 py-1 rounded-full">
                            <BookOpen className="w-3.5 h-3.5" />
                            Financial Intelligence
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Insights & Ecosystem News
                        </h2>
                        <p className="text-muted-foreground max-w-xl text-lg">
                            Stay ahead of the curve. Dive into deep analyses on Ghana's fintech landscape, crypto strategies, and personal finance tips.
                        </p>
                    </div>
                    <Link
                        to="/insights"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors w-fit group"
                    >
                        Explore all insights
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {recentPosts.map((post) => (
                        <Link
                            key={post.id}
                            to={`/insights/${post.slug}`}
                            className="group flex flex-col h-full bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="aspect-[16/9] w-full relative overflow-hidden bg-muted">
                                {post.image_url ? (
                                    <img
                                        src={post.image_url}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                                    </div>
                                )}
                                {/* Category Badge Overlay */}
                                {post.category && (
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-block bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium px-2.5 py-1 rounded-md shadow-sm border border-border/50">
                                            {post.category}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <div className="text-xs text-muted-foreground mb-3 font-medium">
                                    {new Date(post.published_at!).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                                <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-muted-foreground text-sm leading-relaxed flex-1 line-clamp-3">
                                    {post.excerpt}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
