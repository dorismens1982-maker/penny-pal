import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { APP_NAME } from '@/config/app';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MainHeaderProps {
    onGetStarted?: () => void;
}

export const MainHeader = ({ onGetStarted }: MainHeaderProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDashboard = () => {
        setMobileOpen(false);
        navigate('/manage');
    };

    const handleSignIn = () => {
        setMobileOpen(false);
        navigate('/auth');
    };

    const handleSignUp = () => {
        setMobileOpen(false);
        if (onGetStarted) {
            onGetStarted();
        } else {
            navigate('/auth?view=signup');
        }
    };

    const navLinks = [
        { label: 'Explore Insights', href: '/insights', highlight: true },
        { label: 'Community', href: '/community', highlight: false },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 cursor-pointer shrink-0"
                        onClick={() => { navigate('/'); setMobileOpen(false); }}
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">{APP_NAME}</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-2">
                        {navLinks.map(({ label, href, highlight }) => (
                            <button
                                key={href}
                                onClick={() => navigate(href)}
                                className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-all ${highlight
                                    ? 'bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-2'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                {label}
                                {highlight && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                            </button>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        {user ? (
                            <button
                                onClick={handleDashboard}
                                className="text-sm font-semibold bg-slate-900 text-white px-5 py-2 rounded-full hover:bg-slate-700 transition-colors shadow-sm"
                            >
                                Dashboard
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={handleSignIn}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={handleSignUp}
                                    className="text-sm font-semibold bg-primary text-primary-foreground px-5 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
                                >
                                    Sign Up Free
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile: Hamburger/Profile */}
                    <div className="md:hidden flex items-center gap-3">
                        {user ? (
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
                                {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/auth')}
                                className="text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors"
                            >
                                Sign In
                            </button>
                        )}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="p-2 -mr-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors relative z-50"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            <AnimatePresence mode="wait">
                                {mobileOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <X className="w-6 h-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: -90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Menu className="w-6 h-6" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </div>
            </nav>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-40 md:hidden pointer-events-auto"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ backdropFilter: "blur(0px)" }}
                            animate={{ backdropFilter: "blur(4px)" }}
                            exit={{ backdropFilter: "blur(0px)" }}
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setMobileOpen(false)}
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ y: "-100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute top-0 left-0 right-0 bg-primary pt-20 pb-8 px-6 shadow-2xl rounded-b-[2rem]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col gap-2">
                                {navLinks.map(({ label, href }) => (
                                    <motion.button
                                        whileHover={{ x: 10 }}
                                        whileTap={{ scale: 0.98 }}
                                        key={href}
                                        onClick={() => { navigate(href); setMobileOpen(false); }}
                                        className={`text-left px-4 py-4 rounded-xl font-bold text-xl transition-all ${location.pathname === href
                                            ? 'bg-black/10 text-slate-900'
                                            : 'text-slate-800 hover:bg-black/5'
                                            }`}
                                    >
                                        {label}
                                    </motion.button>
                                ))}

                                <div className="mt-6 pt-6 border-t border-black/10 flex flex-col gap-3">
                                    {user ? (
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleDashboard}
                                            className="w-full text-center py-4 rounded-xl font-bold text-lg bg-slate-900 text-white hover:bg-slate-800 shadow-xl transition-all"
                                        >
                                            Go to Dashboard
                                        </motion.button>
                                    ) : (
                                        <>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleSignIn}
                                                className="w-full text-center py-4 rounded-xl font-bold text-lg text-slate-900 hover:bg-black/5 transition-colors border-2 border-slate-900/20"
                                            >
                                                Sign In
                                            </motion.button>
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleSignUp}
                                                className="w-full text-center py-4 rounded-xl font-bold text-lg bg-slate-900 text-white hover:bg-slate-800 shadow-xl transition-all"
                                            >
                                                Sign Up Free
                                            </motion.button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
