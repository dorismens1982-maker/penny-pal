import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { AuthForms } from '@/components/landing/AuthForms';
import { useNavigate } from 'react-router-dom';
import { APP_NAME } from '@/config/app';

interface AuthModalProps {
    open: boolean;
    onClose: () => void;
    /** pre-selects the view: 'welcome' | 'signin' | 'signup' */
    defaultView?: 'welcome' | 'signin' | 'signup';
}

export const AuthModal = ({ open, onClose, defaultView = 'signup' }: AuthModalProps) => {
    const navigate = useNavigate();

    const handleSuccess = () => {
        onClose();
        navigate('/manage');
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal panel */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div
                            className="relative w-full max-w-md bg-background rounded-3xl shadow-2xl border border-border/50 overflow-hidden pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-5 pb-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                                        <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
                                    </div>
                                    <span className="font-bold text-base tracking-tight">{APP_NAME}</span>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted"
                                    aria-label="Close"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Auth Forms */}
                            <div className="px-4 pb-4">
                                <AuthForms onSuccess={handleSuccess} defaultView={defaultView} />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
