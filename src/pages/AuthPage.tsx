import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthForms } from '@/components/landing/AuthForms';
import { APP_NAME } from '@/config/app';

const AuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't redirect if user is on reset-password or forgot-password pages
    const isAuthFlowPage = location.pathname === '/reset-password' || location.pathname === '/forgot-password';
    if (user && !isAuthFlowPage) {
      navigate('/manage');
    }
  }, [user, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Column - Branding (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 relative bg-muted items-center justify-center p-12 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 max-w-lg">
          <Link to="/" className="flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity w-fit">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg">
              <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">{APP_NAME}</span>
          </Link>

          <h1 className="text-4xl font-bold mb-6 text-foreground">
            Master your money,<br />one step at a time.
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Join thousands of users tracking their expenses and achieving their financial goals with {APP_NAME}.
          </p>
        </div>
      </div>

      {/* Right Column - Auth Forms */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-32 relative">
        <Link
          to="/"
          className="lg:hidden flex items-center gap-2 mb-8 mx-auto hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-md">
            <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">{APP_NAME}</span>
        </Link>
        <AuthForms onSuccess={() => navigate('/manage')} />
      </div>
    </div>
  );
};

export default AuthPage;
