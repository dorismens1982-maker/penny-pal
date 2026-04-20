import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { usePageHeader } from '@/hooks/usePageHeader';
import { SEO } from '@/components/SEO';
import DOMPurify from 'dompurify';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import type { BlogPost as BlogPostType } from '@/types/blog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getOptimizedImageUrl } from '@/lib/utils';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { useBlogPost } = useBlogPosts();
  const { header } = usePageHeader('blog-post');
  
  const { data: post, isLoading: loading } = useBlogPost(slug || '');

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background p-4 md:p-10 space-y-8">
            <Skeleton className="w-full h-80 rounded-xl" />
            <div className="max-w-3xl mx-auto space-y-4">
                <Skeleton className="w-3/4 h-12" />
                <Skeleton className="w-1/2 h-6" />
                <Skeleton className="w-full h-64 mt-8" />
            </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl  font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </div>
      </Layout>
    );
  }

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url,
        });
        toast({ title: 'Shared successfully', description: 'Article shared!' });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: 'Link copied',
          description: 'Article link copied to clipboard',
        });
      } catch {
        toast({
          title: 'Failed to copy',
          description: 'Please copy the link manually',
          variant: 'destructive',
        });
      }
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Saving Tips': 'bg-income/10 text-income',
      'Investment Guide': 'bg-primary/10 text-primary',
      'Currency Updates': 'bg-accent/10 text-accent-foreground',
      'Expense Tracking': 'bg-secondary/10 text-secondary-foreground',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  // HTML content safely sanitized
  const sanitizedContent = DOMPurify.sanitize(post.content);

  // Pick hero image
  const rawImage =
    post.image_url ||
    header?.image_url ||
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&fit=crop';
  
  const heroImage = getOptimizedImageUrl(rawImage, 1200);

  return (
    <Layout>
      <SEO
        title={post.title}
        description={post.excerpt}
        image={heroImage}
        type="article"
      />
      <div className="min-h-screen bg-background">
        {/* ✅ Hero Section - Image Only */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
          <img
            src={heroImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          {/* Category Badge - Overlaid on image bottom-left */}
          <div className="absolute bottom-4 left-4">
            {/* Optional overlay content */}
          </div>
        </div>

        {/* ✅ Article Header & Metadata */}
        <div className="max-w-3xl mx-auto px-4 pt-8 md:pt-12">
          <Badge className={`${getCategoryColor(post.category || '')} mb-4`}>
            {post.category}
          </Badge>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl  font-bold mb-6 tracking-tight leading-[1.2] text-foreground text-left">
            {post.title}
          </h1>
          
          <div className="flex items-center whitespace-nowrap gap-x-2 sm:gap-x-4 py-4 border-y border-border/50 text-xs sm:text-sm text-muted-foreground overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 font-medium text-foreground flex-shrink-0">
              By {post.author_name || 'Penny Pal'}
            </div>
            <span className="opacity-30 flex-shrink-0">•</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> 
              {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <span className="opacity-30 flex-shrink-0">•</span>
            <div className="flex items-center gap-1.5 font-medium text-accent flex-shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
              {post.read_time || '5'} min
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/blog')}
              className="h-8 text-xs gap-1.5 border-primary/20 hover:bg-primary/5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Blog
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 text-xs gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
          </div>
        </div>

        {/* ✅ Article Body */}
        <article className="max-w-3xl mx-auto px-4 py-8 md:py-12">
          <div
            className="prose prose-lg max-w-none prose-headings: prose-a:text-primary marker:text-primary ql-editor text-left"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          <div className="mt-12 pt-8 border-t border-border flex justify-center">
            <Button onClick={() => navigate('/blog')} variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              View More Articles
            </Button>
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default BlogPost;
