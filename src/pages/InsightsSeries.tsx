import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Clock, ArrowLeft, BookOpen, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/SEO';
import { GuestBanner } from '@/components/landing/GuestBanner';
import { getOptimizedImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const InsightsSeries = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { useBlogSeries, useSeriesPosts } = useBlogPosts();

    const { data: series, isLoading: seriesLoading } = useBlogSeries(slug || '');
    const { data: posts = [], isLoading: postsLoading } = useSeriesPosts(series?.id || '');

    const loading = seriesLoading || postsLoading;

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </Layout>
        );
    }

    if (!series) {
        return (
            <Layout>
                <div className="min-h-screen flex flex-col items-center justify-center p-4">
                    <h2 className="text-2xl font-bold mb-4">Series not found</h2>
                    <Button onClick={() => navigate('/insights')}>Back to Insights</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <SEO
                title={`${series.title} | Penny Pal Series`}
                description={series.description || series.excerpt}
            />
            <div className="min-h-screen relative bg-slate-50 pb-20">
                {/* Animated Gradient Background */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden h-screen w-screen">
                    <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-income/5 rounded-full blur-[80px]" />
                </div>

                <div className="container max-w-5xl mx-auto px-4 mt-6 space-y-8 relative z-10">
                    {/* Header Section */}
                    <div className="space-y-6 pt-8">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate('/insights')}
                            className="gap-2 -ml-2 text-slate-500 hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Insights
                        </Button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100">
                            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-slate-100/50">
                                <img
                                    src={getOptimizedImageUrl(series.image_url) || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800'}
                                    alt={series.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                                        <Layers className="w-3 h-3" />
                                        Series
                                    </span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary/80 bg-primary/10 px-3 py-1 rounded-full">
                                    {posts.length} {posts.length === 1 ? 'Release' : 'Releases'}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
                                    {series.title}
                                </h1>
                                {series.author_name && (
                                    <p className="text-sm font-medium text-slate-500">
                                        By {series.author_name}
                                    </p>
                                )}
                                <p className="text-slate-600 leading-relaxed text-lg">
                                    {series.description || series.excerpt}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / List of Posts */}
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight  mb-8">
                            In this series
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                            {posts.map((post, idx) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => navigate(`/insights/${post.slug}`)}
                                    className="h-full flex flex-col group cursor-pointer bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="relative w-full aspect-[16/10] rounded-[1.5rem] overflow-hidden mb-5">
                                        <img
                                            src={getOptimizedImageUrl(post.image_url, 600) || 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600'}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-white/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                                Part {idx + 1}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-1 flex flex-col flex-1">
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                                            <span>{new Date(post.published_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {post.read_time || '5'} min
                                            </span>
                                        </div>

                                        <h3 className=" font-bold text-slate-900 text-lg leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>

                                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-4">
                                            {post.excerpt}
                                        </p>

                                        <div className="mt-auto">
                                            <span className="text-sm font-bold text-primary group-hover:underline decoration-2 underline-offset-4">Read Episode</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <GuestBanner />
        </Layout>
    );
};

export default InsightsSeries;
