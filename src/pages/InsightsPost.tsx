import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import type { BlogPost } from '@/types/blog';
import { ArrowLeft, Share2, Clock, Calendar, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BlogInteractions } from '@/components/blog/BlogInteractions';
import { CommentsSection } from '@/components/blog/CommentsSection';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { X } from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';
import DOMPurify from 'dompurify';
import { getOptimizedImageUrl } from '@/lib/utils';

// Ensure Google Fonts used by Quill are available on the public post page
if (typeof document !== 'undefined') {
    const FONT_LINK_ID = 'quill-google-fonts';
    if (!document.getElementById(FONT_LINK_ID)) {
        const link = document.createElement('link');
        link.id = FONT_LINK_ID;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Roboto:wght@300;400;700&family=Poppins:wght@300;400;600;700&family=Lato:wght@300;400;700&family=Montserrat:wght@300;400;600;700&family=Playfair+Display:wght@400;700&family=Merriweather:wght@300;400;700&family=Source+Code+Pro:wght@400;600&display=swap';
        document.head.appendChild(link);
    }
}

import { useBlogPosts } from '@/hooks/useBlogPosts';

const InsightsPost = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { useBlogPost, useRelatedPosts } = useBlogPosts();
    
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const [authModal, setAuthModal] = useState<{ open: boolean; view: 'signin' | 'signup' | 'welcome' }>({ open: false, view: 'signup' });
    
    // Use React Query hooks
    const { data: post, isLoading: loading } = useBlogPost(slug || '');
    const { data: relatedPosts = [] } = useRelatedPosts(post?.category || '', post?.id || '');

    useEffect(() => {
        if (!loading && !post && slug) {
            // Optional: log or handle if slug is clearly wrong
        }
        window.scrollTo(0, 0);
    }, [slug, post, loading]);

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground font-medium">Loading article...</p>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    if (!post) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-bold text-foreground">Article Not Found</h1>
                        <p className="text-muted-foreground">The article you're looking for doesn't exist or is still a draft.</p>
                        <Button onClick={() => navigate('/insights')} className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Insights
                        </Button>
                    </div>
                </div>
            </Layout>
        );
    }

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: post.excerpt || '', url });
        toast({ title: 'Shared successfully!' });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied!', description: 'Article link copied to clipboard.' });
    }
  };

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
      <div className="min-h-screen relative overflow-hidden bg-slate-50">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-br from-primary/5 via-income/5 to-transparent opacity-60" />
          <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute top-[10%] left-[-10%] w-[400px] h-[400px] bg-income/10 rounded-full blur-[80px]" />
        </div>

        <SEO
          title={post.title}
          description={post.excerpt}
          image={getOptimizedImageUrl(post.image_url, 1200)}
          type="article"
          author={post.author_name}
          datePublished={post.published_at || post.created_at}
        />

        <div className="relative z-10 container max-w-5xl mx-auto px-4 py-8 md:py-12">
          {/* Navigation Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <Button
              onClick={() => navigate('/insights')}
              variant="ghost"
              className="bg-white/50 backdrop-blur-sm hover:bg-white/80 border border-white/20 rounded-full px-6 gap-2 transition-all hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Insights
            </Button>

            <Button
              onClick={handleShare}
              variant="ghost"
              size="icon"
              className="bg-white/50 backdrop-blur-sm hover:bg-white/80 border border-white/20 rounded-full w-10 h-10 transition-all hover:scale-110"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Main Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl rounded-[2.5rem] overflow-hidden"
          >
            {/* Hero Image Section */}
            {post.image_url && (
              <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
                <motion.img
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.8 }}
                  src={getOptimizedImageUrl(post.image_url) || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200'}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Title Overlay on Image (Optional/Hybrid approach) - Keeping title separate for minimalism, but adding category here */}
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
                  {/* Category badge removed as requested */}
                </div>
              </div>
            )}

            <div className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto">
              {/* Header Info */}
              <div className="space-y-4 mb-8 text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-4xl lg:text-5xl  font-bold text-slate-900 leading-[1.2] tracking-tight text-left"
                >
                  {post.title}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-x-3 sm:gap-x-4 text-xs sm:text-sm md:text-base text-slate-500 font-medium justify-start overflow-x-auto no-scrollbar pb-1"
                >
                  <div className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-full whitespace-nowrap">
                    <span>By {post.author_name || 'Penny Pal'}</span>
                  </div>
                  <div className="shrink-0 w-1 h-1 bg-slate-400/50 rounded-full" />
                  <div className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-full whitespace-nowrap">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>
                      {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="shrink-0 w-1 h-1 bg-slate-400/50 rounded-full" />
                  <div className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-full whitespace-nowrap">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>{post.read_time || '5'} min</span>
                  </div>
                </motion.div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-slate-200 via-slate-200 to-transparent mb-10" />

              {/* Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="blog-content prose prose-lg max-w-none text-slate-700 ql-editor text-left
                                    prose-headings: prose-headings:font-bold prose-headings:text-slate-900
                                    prose-p:leading-relaxed prose-p:text-slate-600
                                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                    prose-img:rounded-xl prose-img:shadow-sm prose-img:mx-auto prose-img:w-full prose-img:h-auto prose-img:my-8
                                    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                                "
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(post.content, {
                        // Allow class and style attributes so Quill font/color/align classes are preserved
                        ADD_ATTR: ['class', 'style'],
                        ALLOWED_TAGS: [
                            'p', 'br', 'span', 'div', 'a', 'strong', 'em', 'u', 's', 'del',
                            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                            'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
                            'img', 'video', 'source',
                            'table', 'thead', 'tbody', 'tr', 'th', 'td',
                            'sup', 'sub',
                        ],
                        ALLOWED_ATTR: [
                            'href', 'src', 'alt', 'title', 'class', 'style',
                            'target', 'rel', 'width', 'height', 'controls',
                            'data-value', 'spellcheck', 'contenteditable',
                        ],
                    })
                }}
              />

              <div className="mt-8 mb-12">
                <BlogInteractions
                  postId={post.id}
                  onScrollToComments={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                />
              </div>

              {/* Footer Call to Action */}
              <div className="mt-8 pt-10 border-t border-slate-100">
                <div className="bg-slate-50 rounded-2xl p-8 text-center space-y-4">
                  <h3 className="text-xl font-bold  text-slate-900">Enjoyed this article?</h3>
                  <p className="text-slate-600 max-w-md mx-auto">
                    Check out more financial wisdom and tips to grow your wealth with Penny Pal.
                  </p>
                  <Button onClick={() => navigate('/insights')} className="gap-2 rounded-full px-8">
                    Read More Articles
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-slate-100">
                <CommentsSection postId={post.id} />
              </div>
            </div>
          </motion.div>

          {/* Related Posts (Optional - using similar glass effect) */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl  font-bold text-slate-900 mb-8 pl-4 border-l-4 border-primary">
                Keep Reading
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((article, idx) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (idx * 0.1) }}
                    onClick={() => navigate(`/insights/${article.slug}`)}
                    className="group cursor-pointer"
                  >
                    <Card className="h-full border-none bg-white/60 backdrop-blur-lg hover:bg-white/80 transition-all shadow-sm hover:shadow-lg rounded-2xl overflow-hidden group-hover:-translate-y-1">
                      {article.image_url && (
                        <div className="w-full h-48 overflow-hidden">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        {/* Category badge removed for consistency */}
                        <h3 className="font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {article.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Guest sticky sign-up banner ───────────────────────────────────── */}
      {!user && !bannerDismissed && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4"
        >
          <div className="max-w-xl mx-auto bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 px-5 py-4 flex items-center gap-4">
            {/* Icon */}
            <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <img src="/logo.png" className="w-6 h-6 rounded-md object-cover" alt="Penny Pal" />
            </div>
            {/* Copy */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">Track your money like a pro</p>
              <p className="text-white/60 text-xs mt-0.5">Join Penny Pal free — budgeting, insights & more.</p>
            </div>
            {/* Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setAuthModal({ open: true, view: 'signin' })}
                className="text-xs font-medium text-white/70 hover:text-white transition-colors hidden sm:block"
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthModal({ open: true, view: 'signup' })}
                className="text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-md"
              >
                Sign Up Free
              </button>
            </div>
            {/* Dismiss */}
            <button
              onClick={() => setBannerDismissed(true)}
              className="shrink-0 text-white/40 hover:text-white/80 transition-colors ml-1"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      <AuthModal
        open={authModal.open}
        onClose={() => setAuthModal(prev => ({ ...prev, open: false }))}
        defaultView={authModal.view}
      />
    </Layout>
  );
};

export default InsightsPost;
