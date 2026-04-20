import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import type { BlogPost } from '@/types/blog';
import { Clock, Calendar, Search, Sparkles, X, Layers, BookOpen } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_NAME } from '@/config/app';
import { useAuth } from '@/contexts/AuthContext';
import { SEO } from '@/components/SEO';
import { AuthModal } from '@/components/AuthModal';
import { GuestBanner } from '@/components/landing/GuestBanner';
import { getOptimizedImageUrl } from '@/lib/utils';
import { isAdminEmail } from '@/utils/admin';

const Insights = () => {
  const navigate = useNavigate();
  const { posts: allPosts, series: allSeries, loading } = useBlogPosts();
  const { user } = useAuth();
  const isAdmin = isAdminEmail(user?.email);

  // Filter published content
  const posts = isAdmin ? allPosts : allPosts.filter(p => p.published);
  const series = isAdmin ? allSeries : allSeries.filter(s => s.published);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Combine posts and series for the feed
  // Hide posts that belong to a series to avoid redundancy in the main feed
  const standalonePosts = posts.filter(p => !p.series_id);
  
  const combinedContent = [
    ...standalonePosts.map(p => ({ ...p, contentType: 'post' as const })),
    ...series.map(s => ({ ...s, contentType: 'series' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Extract unique categories (only from posts for now)
  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];

  const filteredContent = combinedContent.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || (item.contentType === 'post' && (item as any).category === selectedCategory);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item as any).excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured posts (first 3)
  const featuredPosts = posts.slice(0, 3);
  // Remaining posts for the feed, excluding featured if we want, but for now lets just show filtered list minus featured if "All" is selected? 
  // actually simpler to just show filtered list in feed, and featured at top.
  // If user searches/filters, we might want to hide featured section or filter it too.
  // Let's hide featured section if searching or filtering specific filtrs.
  const showFeatured = selectedCategory === 'All' && !searchQuery;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Saving Tips': 'bg-income/10 text-income border-income/20',
      'Investment Guide': 'bg-primary/10 text-primary border-primary/20',
      'Currency Updates': 'bg-accent/10 text-accent-foreground border-accent/20',
      'Expense Tracking': 'bg-secondary/10 text-secondary-foreground border-secondary/20',
      'Stories': 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return colors[category || ''] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const getAuthorName = (post: BlogPost) => {
    if (post.author_name) return post.author_name;
    if (post.author_roles?.role === 'super_admin' || post.author_roles?.role === 'admin') {
      return APP_NAME;
    }
    return post.author_profile?.full_name || 'Anonymous';
  };

  return (
    <Layout>
      <SEO
        title="Insights | Penny Pal — Financial Tips & Money Guides"
        description="Explore expert financial tips, saving strategies, investment guides and money management articles from the Penny Pal blog."
      />
      <div className="min-h-screen relative bg-slate-50 pb-20">
        {/* Animated Gradient Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden h-screen w-screen">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-income/5 rounded-full blur-[80px]" />
        </div>

        <div className="container max-w-7xl mx-auto px-4 mt-6 space-y-8 relative z-10">

          {/* The Latest & Top Reads Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">

            {/* Left: The Latest */}
            {combinedContent.length > 0 && (
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight ">The Latest</h2>
                <div
                  className="bg-white rounded-[2rem] p-4 pb-6 shadow-sm border border-slate-100 cursor-pointer group hover:shadow-md transition-all relative"
                  onClick={() => {
                    const item = combinedContent[0];
                    if (item.contentType === 'series') {
                      navigate(`/insights/series/${item.slug}`);
                    } else {
                      navigate(`/insights/${item.slug}`);
                    }
                  }}
                >
                  <div className="relative w-full aspect-[16/10] rounded-[1.5rem] overflow-hidden mb-6">
                    <img
                      src={getOptimizedImageUrl(combinedContent[0].image_url) || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200'}
                      alt={combinedContent[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {combinedContent[0].contentType === 'series' && (
                        <div className="absolute top-4 left-4">
                            <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                                <Layers className="w-3 h-3" />
                                Series Release
                            </span>
                        </div>
                    )}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-4 group-hover:text-primary transition-colors ">
                    {combinedContent[0].title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <span>{new Date(combinedContent[0].created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-primary font-medium">
                        {combinedContent[0].contentType === 'series' 
                          ? ((combinedContent[0] as any).author_name || 'Curated Collection') 
                          : getAuthorName(combinedContent[0] as BlogPost)}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed mb-6 line-clamp-3">
                    {combinedContent[0].excerpt || "Explore the latest insights and trends shaping the future of digital finance..."}
                  </p>
                  <span className="font-bold text-primary group-hover:underline decoration-2 underline-offset-4">
                    {combinedContent[0].contentType === 'series' ? 'View Series' : 'Read more'}
                  </span>
                </div>
              </div>
            )}

            {/* Right: Top Reads */}
            {combinedContent.length > 1 && (
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight ">Top Reads</h2>
                <div className="flex flex-col gap-4">
                  {combinedContent.slice(1, 4).map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-[1.5rem] p-3 flex gap-4 items-center shadow-sm border border-slate-100 cursor-pointer group hover:shadow-md transition-all relative"
                      onClick={() => {
                        if (item.contentType === 'series') {
                          navigate(`/insights/series/${item.slug}`);
                        } else {
                          navigate(`/insights/${item.slug}`);
                        }
                      }}
                    >
                      <div className="w-24 h-24 md:w-32 md:h-24 shrink-0 rounded-xl overflow-hidden relative">
                        <img
                          src={getOptimizedImageUrl(item.image_url, 400) || 'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=400'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                         {item.contentType === 'series' && (
                            <div className="absolute top-1 left-1">
                                <span className="bg-primary/90 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                                    Series
                                </span>
                            </div>
                        )}
                      </div>
                      <div className="flex-1 py-1 pr-2">
                        <h4 className="font-bold text-slate-900 leading-snug line-clamp-2 md:line-clamp-3 mb-2 group-hover:text-primary transition-colors text-sm md:text-base ">
                          {item.title}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[11px] md:text-xs text-slate-500">
                          <span className="shrink-0">{new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          <span className="hidden sm:inline text-slate-300">|</span>
                          <span className="text-primary font-medium truncate">
                            {item.contentType === 'series' ? ((item as any).author_name || 'Series') : getAuthorName(item as BlogPost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Browse Categories & Main Grid */}
          <div className="pb-20">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight ">
                Browse by categories
              </h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search blogs..."
                  className="pl-10 h-11 bg-white border-slate-200 rounded-full focus:bg-white transition-all text-sm shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Category Switcher */}
            <div className="flex items-center flex-wrap gap-2 md:gap-4 mb-10 pb-2">
              {categories.map((category, index) => {
                const isActive = selectedCategory === category;
                return (
                  <React.Fragment key={category}>
                    <button
                      onClick={() => setSelectedCategory(category)}
                      className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isActive
                        ? 'bg-transparent text-primary border border-primary shadow-sm'
                        : 'bg-transparent text-slate-500 hover:text-slate-900 border border-transparent'
                        }`}
                    >
                      {category}
                    </button>
                    {!isActive && index < categories.length - 1 && selectedCategory !== categories[index + 1] && (
                      <span className="text-slate-300 hidden md:inline">|</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {filteredContent.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-white/40 rounded-3xl border border-white/20">
                <p>No insights found matching your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredContent.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                        if (item.contentType === 'series') {
                          navigate(`/insights/series/${item.slug}`);
                        } else {
                          navigate(`/insights/${item.slug}`);
                        }
                      }}
                    className="h-full flex flex-col group cursor-pointer"
                  >
                    <div className="bg-white rounded-[2rem] p-4 pb-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 relative">

                      <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden mb-6 filter group-hover:brightness-105 transition-all">
                        <img
                          src={getOptimizedImageUrl(item.image_url, 800) || 'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=800'}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {item.contentType === 'series' && (
                            <div className="absolute top-4 left-4">
                                <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md">
                                    <Layers className="w-3 h-3" />
                                    Series
                                </span>
                            </div>
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="flex flex-col flex-1 px-1">
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                          <span>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          {item.contentType === 'post' && (
                             <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {(item as BlogPost)!.read_time || '5'} min
                             </span>
                          )}
                          {item.contentType === 'series' && (
                             <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                Series
                             </span>
                          )}
                        </div>

                        <h3 className=" font-bold text-slate-900 text-lg leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </h3>

                        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                          {item.excerpt || "It is a long established fact that a reader will be distracted by the readable content of a page from when looking at its layout..."}
                        </p>

                        <div className="mt-auto">
                          <span className="text-sm font-bold text-primary group-hover:underline decoration-2 underline-offset-4">
                            {item.contentType === 'series' ? 'Explore Series' : 'Read More'}
                          </span>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <GuestBanner />
    </Layout>
  );
};

export default Insights;
