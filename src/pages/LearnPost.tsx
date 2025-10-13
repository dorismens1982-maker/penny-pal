import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getBlogPost, blogPosts } from '@/data/blogPosts';
import { ArrowLeft, Share2, Clock, Calendar, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const LearnPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const post = getBlogPost(slug || '');

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">Article Not Found</h1>
            <p className="text-muted-foreground">The article you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/learn')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Learn
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
        await navigator.share({ title: post.title, text: post.excerpt, url });
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
      'Saving Tips': 'bg-income/10 text-income',
      'Investment Guide': 'bg-primary/10 text-primary',
      'Currency Updates': 'bg-accent/10 text-accent-foreground',
      'Expense Tracking': 'bg-secondary/10 text-secondary-foreground',
      'Stories': 'bg-muted text-muted-foreground',
    };
    return colors[category] || 'bg-muted text-muted-foreground';
  };

  // Enhanced content rendering with better markdown support
  const renderContent = (content: string) => {
    const lines = content.trim().split('\n');
    const elements: JSX.Element[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // H1
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={key++} className="text-3xl md:text-4xl font-poppins font-bold text-foreground mt-8 mb-4">
            {line.slice(2)}
          </h1>
        );
      }
      // H2
      else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={key++} className="text-2xl md:text-3xl font-poppins font-bold text-foreground mt-6 mb-3">
            {line.slice(3)}
          </h2>
        );
      }
      // H3
      else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={key++} className="text-xl md:text-2xl font-semibold text-foreground mt-5 mb-2">
            {line.slice(4)}
          </h3>
        );
      }
      // Unordered list
      else if (line.startsWith('- ')) {
        elements.push(
          <li key={key++} className="ml-6 mb-2 text-muted-foreground leading-relaxed list-disc">
            {line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
          </li>
        );
      }
      // Paragraph with bold support
      else {
        const content = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
        elements.push(
          <p
            key={key++}
            className="mb-4 text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );
      }
    }

    return elements;
  };

  // Get related articles (same category, exclude current)
  const relatedArticles = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section with Image */}
        {post.image && (
          <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-3xl mx-auto px-4 -mt-32 relative z-10">
          <article className="bg-background rounded-lg shadow-xl p-6 md:p-8">
            {/* Category & Sponsor Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
              {post.sponsor && (
                <Badge variant="outline" className="text-xs">
                  Sponsored by {post.sponsor.name}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-foreground mb-4">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.readTime} min read</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-8">
              <Button onClick={() => navigate('/learn')} variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button onClick={handleShare} variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              {renderContent(post.content)}
            </div>

            {/* Sponsor Section */}
            {post.sponsor && (
              <div className="mt-12 p-6 bg-gradient-to-br from-primary/5 to-income/5 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">This article is brought to you by</p>
                <h3 className="text-xl font-poppins font-bold text-foreground mb-2">
                  {post.sponsor.name}
                </h3>
                {post.sponsor.message && (
                  <p className="text-muted-foreground italic">{post.sponsor.message}</p>
                )}
              </div>
            )}

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h2 className="text-2xl font-poppins font-bold text-foreground mb-6">
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedArticles.map((article) => (
                    <Card
                      key={article.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate(`/learn/${article.slug}`)}
                    >
                      {article.image && (
                        <div className="w-full h-32 overflow-hidden rounded-t-lg">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                          {article.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {article.readTime} min read
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 text-center">
              <Button onClick={() => navigate('/learn')} size="lg" className="gap-2">
                View More Articles
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </article>
        </div>
      </div>
    </Layout>
  );
};

export default LearnPost;
