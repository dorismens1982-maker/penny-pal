import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export const ChristmasGreeting = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        // 1. Check if we should show the greeting
        const checkGreetingEligibility = () => {
            const today = new Date();
            const currentYear = today.getFullYear();
            const storageKey = `hasSeenChristmasGreeting${currentYear}`;
            const hasSeen = localStorage.getItem(storageKey);

            // Dev overwrite: ?test-christmas=true
            const isTestMode = new URLSearchParams(window.location.search).has('test-christmas');

            // Date check: Dec 24th, 25th, or 26th
            const isChristmasTime =
                today.getMonth() === 11 &&
                (today.getDate() === 24 || today.getDate() === 25 || today.getDate() === 26);

            if ((isChristmasTime && !hasSeen) || isTestMode) {
                setIsOpen(true);
            }
        };

        checkGreetingEligibility();

        // Resize handler for confetti
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
        // Mark as seen
        const currentYear = new Date().getFullYear();
        localStorage.setItem(`hasSeenChristmasGreeting${currentYear}`, 'true');
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-[100] pointer-events-none">
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.15}
                />
            </div>

            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="sm:max-w-md border-0 p-0 overflow-hidden bg-transparent shadow-none">
                    <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden">
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute right-4 top-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Christmas Card Image */}
                        <div className="relative w-full aspect-square">
                            <img
                                src="/christmas-card-simple.png"
                                alt="Merry Christmas from Penny Pal"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 bg-gradient-to-r from-red-600 to-red-700 text-center">
                            <h3 className="text-xl font-bold text-white mb-2">Happy Holidays! 🎄</h3>
                            <p className="text-red-100 mb-4 text-sm">
                                Wishing you financial wellness and joy this season.
                            </p>
                            <Button
                                onClick={handleClose}
                                variant="secondary"
                                className="w-full bg-white text-red-600 hover:bg-gray-100 font-semibold"
                            >
                                Thank You!
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
