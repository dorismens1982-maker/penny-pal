import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PartnersSection } from '@/components/landing/PartnersSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { APP_NAME } from '@/config/app';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (user) {
      navigate('/manage');
    }
  }, [user, navigate]);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
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
            onClick={handleGetStarted}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection
        onGetStarted={handleGetStarted}
        videoSrc="https://res.cloudinary.com/dopscbnty/video/upload/v1770858068/Create_a_smooth_202602112137_o9z9x_qwm381.mp4"
      />

      {/* Features Section */}
      <FeaturesSection />

      {/* Partners / B2B Section */}
      <PartnersSection />

      <LandingFooter />
    </div>
  );
};


export default LandingPage;
