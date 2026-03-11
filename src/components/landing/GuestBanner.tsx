import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';

export const GuestBanner = () => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; view: 'welcome' | 'signin' | 'signup' }>({ open: false, view: 'signup' });
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if user has already dismissed the banner in this session/browser
    const dismissed = localStorage.getItem('guest-banner-dismissed');
    setIsDismissed(!!dismissed);

    if (!user && !dismissed) {
      // Small delay after page load for better UX
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('guest-banner-dismissed', 'true');
  };

  const openAuth = (view: 'signin' | 'signup') => {
    setAuthModal({ open: true, view });
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && !user && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4"
          >
            <div className="max-w-xl mx-auto bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-2xl border border-white/10 px-5 py-4 flex items-center gap-4">
              {/* Logo Icon */}
              <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <img src="/logo.png" className="w-6 h-6 rounded-md object-cover" alt="Penny Pal" />
              </div>
              
              {/* Marketing Copy */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm leading-tight">Track your money like a pro</p>
                <p className="text-white/60 text-xs mt-0.5">Join Penny Pal free — budgeting, insights & more.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openAuth('signin')}
                  className="text-xs font-medium text-white/70 hover:text-white transition-colors hidden sm:block px-2"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-md"
                >
                  Sign Up Free
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="shrink-0 text-white/40 hover:text-white/80 transition-colors ml-1 p-1"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal
        open={authModal.open}
        onClose={() => setAuthModal(prev => ({ ...prev, open: false }))}
        defaultView={authModal.view}
      />
    </>
  );
};
