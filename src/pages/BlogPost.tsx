import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBlogPost } from '@/data/blogPosts';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePageHeader } from '@/hooks/usePageHeader';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const post = slug ? getBlogPost(slug) : undefined;
  const { header } = usePageHeader('blog-post');

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

  // Convert simple markdown-style content to JSX
  const renderContent = (content: string) =>
    content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-3xl font-poppins font-bold mt-8 mb-4 text-foreground">
            {line.substring(2)}
          </h1>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-poppins font-bold mt-6 mb-3 text-foreground">
            {line.substring(3)}
          </h2>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-foreground">
            {line.substring(4)}
          </h3>
        );
      }

      // bold
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        return (
          <p key={index} className="mb-4 text-foreground leading-relaxed">
            {parts.map((part, i) =>
              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
            )}
          </p>
        );
      }

      // list items
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 mb-2 text-foreground">{line.substring(2)}</li>;
      }

      if (line.trim() === '') return <div key={index} className="h-2" />;

      return (
        <p key={index} className="mb-4 text-foreground leading-relaxed">
          {line}
        </p>
      );
    });

  // Pick hero image
  const heroImage =
    post.image ||
    header?.image_url ||
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&fit=crop';

  return (
    <Layout>
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-poppins font-bold mb-2">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {post.readTime} min read
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
          <div className="prose prose-lg max-w-none">{renderContent(post.content)}</div>

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
