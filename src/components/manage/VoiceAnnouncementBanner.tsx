import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Mic, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const VoiceAnnouncementBanner = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const isDismissed = localStorage.getItem('voice_announcement_dismissed');
        if (!isDismissed) {
            // Delay showing slightly for a better entrance
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('voice_announcement_dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="overflow-hidden relative w-full"
                >
                    <div className="relative p-5 md:p-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 shadow-xl border border-white/20 overflow-hidden group">
                        {/* Background Decorative Elements */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-700" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl" />
                        
                        <button 
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1 rounded-full bg-black/10 text-white/70 hover:bg-black/20 hover:text-white transition-all z-20"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 relative z-10">
                            {/* Icon/Badge Section */}
                            <div className="relative shrink-0">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    <Mic className="w-7 h-7 text-white animate-pulse" />
                                </div>
                                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-lg border border-white animate-bounce">
                                    NEW
                                </div>
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-white font-merriweather font-bold text-lg md:text-xl flex items-center justify-center md:justify-start gap-2">
                                    Just Talk. We'll Handle the Rest. 🎙️
                                    <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse hidden md:block" />
                                </h3>
                                <p className="text-white/80 text-xs md:text-sm mt-1 max-w-[500px]">
                                    Log expenses hands-free with AI! Every user gets <span className="text-yellow-300 font-bold">5 Free Voice Stars</span> monthly to start.
                                </p>
                            </div>

                            {/* Action Button */}
                            <div className="shrink-0">
                                <Button 
                                    variant="secondary"
                                    className="bg-white text-indigo-700 hover:bg-yellow-400 hover:text-black font-black rounded-xl px-6 shadow-lg hover:shadow-yellow-400/20 hover:scale-105 transition-all duration-300 border-none"
                                    onClick={() => {
                                        // Scroll to voice section if needed, or just let them see it below
                                        const voiceSection = document.getElementById('tour-voice-section');
                                        if (voiceSection) {
                                            voiceSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }
                                    }}
                                >
                                    <Zap className="w-4 h-4 mr-2 fill-current" />
                                    TRY IT NOW
                                </Button>
                            </div>
                        </div>

                        {/* Floating Micro-particles */}
                        <div className="absolute top-4 right-1/4">
                             <Star className="w-2 h-2 text-white/30 fill-white/20 animate-ping" style={{ animationDuration: '3s' }} />
                        </div>
                        <div className="absolute bottom-4 left-1/3">
                             <Star className="w-3 h-3 text-white/20 fill-white/10 animate-ping" style={{ animationDuration: '4s' }} />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
