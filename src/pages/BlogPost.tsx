import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBlogPost } from '@/data/blogPosts';
import { ArrowLeft, Clock, Calendar, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/PageHeader';
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
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
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
          url: url,
        });
        toast({
          title: "Shared successfully",
          description: "Article shared!",
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback to copying link
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied",
          description: "Article link copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Failed to copy",
          description: "Please copy the link manually",
          variant: "destructive",
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

  // Convert markdown-style content to HTML
  const renderContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      // Headings
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-poppins font-bold mt-8 mb-4 text-foreground">{line.substring(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-poppins font-bold mt-6 mb-3 text-foreground">{line.substring(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-foreground">{line.substring(4)}</h3>;
      }
      
      // Bold text
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(boldRegex);
        return (
          <p key={index} className="mb-4 text-foreground leading-relaxed">
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
          </p>
        );
      }
      
      // List items
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 mb-2 text-foreground">{line.substring(2)}</li>;
      }
      
      // Empty lines
      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }
      
      // Regular paragraphs
      return <p key={index} className="mb-4 text-foreground leading-relaxed">{line}</p>;
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {header && (
          <PageHeader
            title={post.title}
            subtitle={`${post.category} • ${post.readTime} min read`}
            imageUrl={header.image_url}
            mobileImageUrl={header.mobile_image_url}
            altText={header.alt_text}
            heightMobile={header.height_mobile}
            heightDesktop={header.height_desktop}
            overlayOpacity={header.overlay_opacity}
            textColor={header.text_color}
          >
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/blog')}
                className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
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
          </PageHeader>
        )}

        {/* Content */}
        <article className="max-w-3xl mx-auto px-4 py-8">
          <div className="prose prose-lg max-w-none">
            {renderContent(post.content)}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-border">
            <Button
              onClick={() => navigate('/blog')}
              variant="outline"
              size="lg"
            >
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
