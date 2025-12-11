import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import type { BlogPost } from '@/types/blog';
import { Clock, Calendar, ArrowRight, Search, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCloudinaryUrl } from '@/utils/cloudinary';

const Insights = () => {
  const navigate = useNavigate();
  const { posts, loading } = useBlogPosts();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
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

  return (
    <Layout>
      <div className="min-h-screen relative bg-slate-50 pb-20 md:-mt-[60px] md:pt-[60px]">
        {/* Animated Gradient Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden h-screen w-screen">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] bg-income/5 rounded-full blur-[80px]" />
        </div>

        {/* Sticky Header with Search & Filter */}
        <div className={`sticky top-0 md:top-[60px] z-40 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20' : 'bg-transparent'}`}>
          <div className="container max-w-7xl mx-auto px-4 pt-4 pb-2 md:pt-6 md:pb-4 space-y-4">
            {/* Top Bar: Title & Search */}
            <div className="flex items-center justify-between gap-4">
              <h1 className={`font-poppins font-bold text-slate-900 transition-all ${scrolled ? 'text-lg' : 'text-2xl'}`}>
                Insights
              </h1>
              <div className="relative flex-1 max-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Discover..."
                  className="pl-9 h-9 bg-white/50 border-white/20 rounded-full focus:bg-white transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Horizontal Scroll Categories */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear-fade">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                    ? 'bg-slate-900 text-white shadow-md scale-105'
                    : 'bg-white/60 text-slate-600 hover:bg-white hover:scale-105 border border-transparent'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container max-w-7xl mx-auto px-4 mt-6 space-y-8 relative z-10">

          {/* Visual Header */}
          <div className="relative w-full h-32 md:h-40 rounded-xl overflow-hidden bg-muted shadow-sm group">
            <img
              src={getCloudinaryUrl('vibe_insights.png')}
              alt="Insights"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <h2 className="text-white font-bold text-xl md:text-2xl">Financial Wisdom</h2>
            </div>
          </div>

          {/* Featured Carousel (Mobile First Snap) */}
          <AnimatePresence>
            {showFeatured && featuredPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 px-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Trending Now</h2>
                </div>

                {/* Snap Scroll Container */}
                <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 -mx-4 px-4">
                  {featuredPosts.map((post) => (
                    <div
                      key={post.id}
                      className="snap-center shrink-0 w-[85vw] md:w-[400px] first:pl-0"
                      onClick={() => navigate(`/insights/${post.slug}`)}
                    >
                      <div className="relative h-[180px] md:h-[240px] rounded-[2rem] overflow-hidden shadow-lg group cursor-pointer">
                        <img
                          src={post.image_url || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=60'}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                          <Badge className="bg-white/20 backdrop-blur-md border-none text-white hover:bg-white/30 mb-2">
                            {post.category}
                          </Badge>
                          <h3 className="font-poppins font-bold text-xl leading-tight line-clamp-2 mb-2">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-white/80">
                            <Clock className="w-3 h-3" />
                            <span>5 min read</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Feed List */}
          <div className="pb-20">
            <div className="flex items-center justify-between px-1 mb-4">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                {selectedCategory === 'All' ? 'Latest Updates' : selectedCategory}
              </h2>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="py-12 text-center text-slate-500 bg-white/40 rounded-3xl border border-white/20">
                <p>No insights found matching your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPosts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => navigate(`/insights/${post.slug}`)}
                    className="h-full"
                  >
                    <div className="group bg-white/70 backdrop-blur-sm hover:bg-white p-3 rounded-3xl shadow-sm border border-white/40 cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] flex gap-4 items-center h-full">
                      {/* Thumbnail */}
                      <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                        <img
                          src={post.image_url || 'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=800&auto=format&fit=crop&q=60'}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </span>
                        </div>
                        <h3 className="font-poppins font-bold text-slate-900 text-sm md:text-base leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span>5 min</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-slate-300 group-hover:text-primary transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Insights;
