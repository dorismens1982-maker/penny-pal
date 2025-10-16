import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { blogPosts, BlogPost } from '@/data/blogPosts';
import { Clock, Calendar, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Learn = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories = ['All', 'Saving Tips', 'Investment Guide', 'Currency Updates', 'Expense Tracking', 'Stories'];

  const filteredPosts =
    selectedCategory === 'All'
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory);

  const featuredPosts = blogPosts.filter((post) => post.featured);
  const sponsoredPosts = blogPosts.filter((post) => post.sponsor);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Saving Tips': 'bg-income/10 text-income hover:bg-income/20',
      'Investment Guide': 'bg-primary/10 text-primary hover:bg-primary/20',
      'Currency Updates': 'bg-accent/10 text-accent-foreground hover:bg-accent/20',
      'Expense Tracking': 'bg-secondary/10 text-secondary-foreground hover:bg-secondary/20',
      'Stories': 'bg-muted text-muted-foreground hover:bg-muted/80',
    };
    return colors[category] || 'bg-muted text-muted-foreground hover:bg-muted/80';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">

        {/* Sticky Category Header */}
        <div
          className={`sticky z-30 backdrop-blur-lg border-b border-border transition-all duration-300 top-16 md:top-20 ${
            scrolled ? 'bg-background/95 shadow-md' : 'bg-background/80'
          }`}
        >
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-2 py-4 px-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground shadow-sm scale-[1.03]'
                    : 'hover:scale-105'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative bg-gradient-to-br from-primary/10 via-background to-income/10 py-12 md:py-16 px-4 border-b border-border">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/80 backdrop-blur rounded-full border border-border mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Financial Education Hub</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-poppins font-bold text-foreground">
              Your Daily Dose of Money Lessons
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Financial wisdom for young Africans building wealth. Learn, act, and grow your money with practical tips and insights.
            </p>
          </div>
        </div>

        {/* Featured Stories Carousel */}
        {featuredPosts.length > 0 && (
          <div className="bg-muted/30 py-8 px-4 border-b border-border">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-poppins font-bold text-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Featured Stories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredPosts.map((post: BlogPost) => (
                  <Card
                    key={post.id}
                    className="shadow-lg hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
                    onClick={() => navigate(`/learn/${post.slug}`)}
                  >
                    {post.image && (
                      <div className="w-full h-48 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <Badge className={getCategoryColor(post.category)} variant="outline">
                        {post.category}
                      </Badge>
                      <h3 className="text-lg font-poppins font-bold text-foreground mt-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                        <Clock className="w-3 h-3" />
                        <span>{post.readTime} min</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {filteredPosts.map((post: BlogPost, index) => (
              <React.Fragment key={post.id}>
                <Card
                  className="shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/learn/${post.slug}`)}
                >
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
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(post.category)}>
                          {post.category}
                        </Badge>
                        {post.sponsor && (
                          <Badge variant="outline" className="text-xs">
                            Sponsored by {post.sponsor.name}
                          </Badge>
                        )}
                      </div>

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

                {/* Sponsored Content Block (after 2nd article) */}
                {index === 1 && sponsoredPosts.length > 0 && (
                  <Card className="shadow-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-income/5">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <Badge variant="outline" className="bg-background">
                            Sponsored Content
                          </Badge>
                          <h3 className="text-xl font-poppins font-bold text-foreground">
                            {sponsoredPosts[0].title}
                          </h3>
                          <p className="text-muted-foreground">
                            {sponsoredPosts[0].excerpt}
                          </p>
                          {sponsoredPosts[0].sponsor && (
                            <p className="text-sm text-muted-foreground italic">
                              {sponsoredPosts[0].sponsor.message}
                            </p>
                          )}
                          <Button
                            onClick={() => navigate(`/learn/${sponsoredPosts[0].slug}`)}
                            className="gap-2"
                          >
                            Learn More
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </React.Fragment>
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

        {/* Community Corner */}
        <div className="bg-gradient-to-br from-muted/50 to-primary/5 py-12 px-4 border-t border-border mt-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-poppins font-bold text-foreground">
              Money Quote of the Day
            </h2>
            <blockquote className="text-xl md:text-2xl text-muted-foreground italic max-w-2xl mx-auto">
              "The habit of saving is itself an education; it fosters every virtue, teaches self-denial, cultivates the sense of order, trains to forethought, and so broadens the mind."
            </blockquote>
            <p className="text-sm text-muted-foreground">— T.T. Munger</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Learn;
