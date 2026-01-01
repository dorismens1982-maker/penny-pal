import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

export const NewYearGreeting = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const checkGreetingEligibility = () => {
            const today = new Date();
            const currentYear = today.getFullYear();
            // New Year 2026 specific logic
            const targetYear = 2026;
            const storageKey = `hasSeenNewYearGreeting${targetYear}`;
            const hasSeen = localStorage.getItem(storageKey);

            const isTestMode = new URLSearchParams(window.location.search).has('test-newyear');

            // Show on Dec 31st and Jan 1st-7th
            const isNewYearTime =
                (today.getMonth() === 11 && today.getDate() === 31) || // Dec 31
                (today.getMonth() === 0 && today.getDate() <= 7);      // Jan 1-7

            if ((isNewYearTime && !hasSeen) || isTestMode) {
                setIsOpen(true);
            }
        };

        checkGreetingEligibility();

        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        const targetYear = 2026;
        localStorage.setItem(`hasSeenNewYearGreeting${targetYear}`, 'true');
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] pointer-events-none">
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.15}
                    colors={['#FFD700', '#FFA500', '#C0C0C0', '#FFFFFF', '#000000']}
                />
            </div>

            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="sm:max-w-md border-0 p-0 overflow-hidden bg-transparent shadow-none">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            duration: 0.6
                        }}
                        className="relative bg-white rounded-lg shadow-2xl overflow-hidden border border-amber-200"
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute right-4 top-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* New Year Card Image with Shimmer Effect */}
                        <div className="relative w-full aspect-square bg-black group overflow-hidden">
                            <img
                                src="/new-year-card.png"
                                alt="Happy New Year 2026"
                                className="w-full h-full object-cover"
                            />
                            {/* Shimmer Overlay */}
                            <div className="absolute inset-0 z-10 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 bg-gradient-to-r from-gray-900 via-black to-gray-900 text-center border-t-4 border-amber-400">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <h3 className="text-xl font-bold text-amber-400 mb-2">Happy New Year! 🎆</h3>
                                <p className="text-gray-300 mb-4 text-sm">
                                    Wishing you a prosperous and financially amazing 2026.
                                </p>
                                <Button
                                    onClick={handleClose}
                                    className="w-full bg-amber-400 text-black hover:bg-amber-300 font-bold"
                                >
                                    Let's crush 2026! 🚀
                                </Button>
                            </motion.div>
                        </div>
                    </motion.div>
                </DialogContent>
            </Dialog>
        </>
    );
};
