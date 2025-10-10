import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { blogPosts, BlogPost } from '@/data/blogPosts';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { usePageHeader } from '@/hooks/usePageHeader';

const Blog = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { header } = usePageHeader('blog');

  const categories = ['All', 'Saving Tips', 'Investment Guide', 'Currency Updates', 'Expense Tracking'];

  const filteredPosts =
    selectedCategory === 'All'
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Saving Tips': 'bg-income/10 text-income hover:bg-income/20',
      'Investment Guide': 'bg-primary/10 text-primary hover:bg-primary/20',
      'Currency Updates': 'bg-accent/10 text-accent-foreground hover:bg-accent/20',
      'Expense Tracking': 'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20',
    };
    return colors[category] || 'bg-muted text-muted-foreground hover:bg-muted/80';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {header && (
          <PageHeader
            title={header.title}
            subtitle={header.subtitle}
            imageUrl={header.image_url}
            mobileImageUrl={header.mobile_image_url}
            altText={header.alt_text}
            heightMobile={header.height_mobile}
            heightDesktop={header.height_desktop}
            overlayOpacity={header.overlay_opacity}
            textColor={header.text_color}
          />
        )}

        {/* Category Filter */}
        <div className="sticky top-0 z-10 bg-background border-b border-border py-4 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="transition-all"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {filteredPosts.map((post: BlogPost) => (
              <Card
                key={post.id}
                className="shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                {/* ✅ Added Thumbnail Image */}
                {post.image && (
                  <div className="w-full h-56 overflow-hidden rounded-t-lg">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Category Badge */}
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>

                    {/* Title */}
                    <h2 className="text-2xl font-poppins font-bold text-foreground group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-muted-foreground leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime} min read</span>
                      </div>
                    </div>

                    {/* Read More Link */}
                    <div className="flex items-center space-x-2 text-primary font-medium group-hover:gap-3 transition-all">
                      <span>Read article</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No articles found in this category yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
