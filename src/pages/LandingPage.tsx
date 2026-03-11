import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainHeader } from '@/components/MainHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { LandingNewsletter } from '@/components/landing/LandingNewsletter';
import { LandingInsights } from '@/components/landing/LandingInsights';
import { PartnersSection } from '@/components/landing/PartnersSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { GuestBanner } from '@/components/landing/GuestBanner';

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
      <MainHeader onGetStarted={handleGetStarted} />

      {/* Hero Section */}
      <HeroSection
        onGetStarted={handleGetStarted}
        videoSrc="https://res.cloudinary.com/dopscbnty/video/upload/v1770858068/Create_a_smooth_202602112137_o9z9x_qwm381.mp4"
      />

      {/* Insights Section */}
      <LandingInsights />

      {/* Newsletter Section */}
      <LandingNewsletter />

      {/* Features Section */}
      <FeaturesSection />

      {/* Partners / B2B Section */}
      <PartnersSection />

      <LandingFooter />
      <GuestBanner />
    </div>
  );
};


export default LandingPage;
