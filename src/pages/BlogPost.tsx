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

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { fetchPostBySlug } = useBlogPosts();
  const { header } = usePageHeader('blog-post');
  
  const [post, setPost] = React.useState<BlogPostType | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      setLoading(true);
      const data = await fetchPostBySlug(slug);
      setPost(data);
      setLoading(false);
    };
    loadPost();
  }, [slug, fetchPostBySlug]);

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
          <h1 className="text-2xl font-poppins font-bold mb-4">Article Not Found</h1>
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
  const heroImage =
    post.image ||
    header?.image_url ||
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&fit=crop';

  return (
    <Layout>
      <SEO
        title={post.title}
        description={post.excerpt}
        image={heroImage}
        type="article"
      />
      <div className="min-h-screen bg-background">
        {/* ✅ Hero Section */}
        <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
          <img
            src={heroImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute bottom-6 left-4 right-4 text-white">
            <Badge className={`${getCategoryColor(post.category)} mb-2`}>
              {post.category}
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-poppins font-bold mb-4 tracking-tight leading-[1.1] max-w-4xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base opacity-95 font-medium">
              <span className="flex items-center gap-2">
                By {post.author_name || 'Anonymous'}
              </span>
              <span className="opacity-60">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {post.date || new Date(post.published_at || '').toLocaleDateString()}
              </span>
              <span className="opacity-60">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {post.readTime || '5'} min read
              </span>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/blog')}
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShare}
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* ✅ Article Body */}
        <article className="max-w-3xl mx-auto px-4 py-10">
          <div
            className="prose prose-lg max-w-none prose-headings:font-poppins prose-a:text-primary marker:text-primary"
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
