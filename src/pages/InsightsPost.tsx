import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const InsightsPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();

        if (error) throw error;
        setPost(data);

        if (data?.category) {
          const { data: related } = await (supabase as any)
            .from('blog_posts')
            .select('*')
            .eq('category', data.category)
            .eq('published', true)
            .neq('id', data.id)
            .limit(3);

          setRelatedPosts(related || []);
        }
      } catch (error: any) {
        console.error('Error fetching post:', error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug]);

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
            <p className="text-muted-foreground">The article you're looking for doesn't exist.</p>
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
                  src={post.image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Title Overlay on Image (Optional/Hybrid approach) - Keeping title separate for minimalism, but adding category here */}
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
                  <Badge className={`${getCategoryColor(post.category || '')} backdrop-blur-md border px-4 py-1.5 text-sm font-medium`}>
                    {post.category}
                  </Badge>
                </div>
              </div>
            )}

            <div className="p-6 md:p-12 lg:p-16 max-w-2xl mx-auto">
              {/* Header Info */}
              <div className="space-y-6 mb-10 text-center md:text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-slate-900 leading-tight tracking-tight"
                >
                  {post.title}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium md:justify-start justify-center"
                >
                  <div className="flex items-center gap-1.5 bg-slate-100/50 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(post.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <div className="flex items-center gap-1.5 bg-slate-100/50 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span>5 min read</span>
                  </div>
                </motion.div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-10" />

              {/* Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="prose prose-lg md:prose-xl max-w-none text-slate-700
                                    prose-headings:font-poppins prose-headings:font-bold prose-headings:text-slate-900
                                    prose-p:leading-relaxed prose-p:text-slate-600
                                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                    prose-img:rounded-xl prose-img:shadow-sm prose-img:mx-auto prose-img:w-full prose-img:h-auto prose-img:my-8
                                    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                                    [&_.ql-align-center]:text-center
                                    [&_.ql-align-right]:text-right
                                    [&_.ql-align-justify]:text-justify
                                "
                dangerouslySetInnerHTML={{ __html: post.content }}
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
                  <h3 className="text-xl font-bold font-poppins text-slate-900">Enjoyed this article?</h3>
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
              <h2 className="text-2xl font-poppins font-bold text-slate-900 mb-8 pl-4 border-l-4 border-primary">
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
                        <Badge variant="secondary" className="mb-3 text-xs font-normal">
                          {article.category}
                        </Badge>
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
    </Layout>
  );
};

export default InsightsPost;
