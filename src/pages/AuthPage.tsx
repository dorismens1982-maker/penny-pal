import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { AuthForms } from '@/components/landing/AuthForms';
import { FloatingCedis } from '@/components/landing/FloatingCedis';
import { APP_NAME } from '@/config/app';

const AuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const authScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      navigate('/manage');
    }
  }, [user, navigate]);

  const scrollToAuth = () => {
    authScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <FloatingCedis />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">{APP_NAME}</span>
          </div>
          <button
            onClick={scrollToAuth}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection onGetStarted={scrollToAuth} />

      {/* Features Section */}
      <FeaturesSection />

      {/* Auth Section */}
      <section ref={authScrollRef} className="py-20 bg-muted/50 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/4" />

        <div className="container px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <div className="order-2 lg:order-1 space-y-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/20 mb-6 group">
                <img
                  src="/male-finance.png"
                  alt="Young man managing finances"
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <p className="text-white font-medium text-lg">"Achieving my financial dreams one step at a time."</p>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to take control?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of users who are already mastering their finances with {APP_NAME}.
                It's free, secure, and easy to use.
              </p>
              <ul className="space-y-4">
                {[
                  "Unlimited transaction tracking",
                  "Visual financial insights",
                  "Export data anytime",
                  "Dark mode included"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="order-1 lg:order-2">
              <AuthForms onSuccess={() => navigate('/manage')} />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};


export default AuthPage;
