import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

const drawGhanaFlag = (ctx: CanvasRenderingContext2D) => {
    const w = 24;
    const h = 16;
    const x = -w / 2;
    const y = -h / 2;

    // Red
    ctx.fillStyle = '#CE1126';
    ctx.fillRect(x, y, w, h / 3);

    // Yellow
    ctx.fillStyle = '#FCD116';
    ctx.fillRect(x, y + h / 3, w, h / 3);

    // Green
    ctx.fillStyle = '#006B3F';
    ctx.fillRect(x, y + 2 * h / 3, w, h / 3);

    // Black Star
    const cx = 0;
    const cy = 0;
    const outerRadius = 3;
    const innerRadius = 1.2;
    const spikes = 5;
    let rot = (Math.PI / 2) * 3;
    let sx = cx;
    let sy = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        sx = cx + Math.cos(rot) * outerRadius;
        sy = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(sx, sy);
        rot += step;

        sx = cx + Math.cos(rot) * innerRadius;
        sy = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(sx, sy);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = '#000000';
    ctx.fill();
};

const IndependenceDaySplash: React.FC = () => {
    const [showSplash, setShowSplash] = useState(false);
    const [windowDimension, setWindowDimension] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        // Handle resizing for confetti
        const detectSize = () => {
            setWindowDimension({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener('resize', detectSize);

        // Small delay before showing to ensure rendering is ready
        const timer = setTimeout(() => {
            setShowSplash(true);
        }, 500);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', detectSize);
        };
    }, []);

    const handleClose = () => {
        setShowSplash(false);
    };

    return (
        <AnimatePresence>
            {showSplash && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={handleClose}
                >
                    {/* Confetti effect that fills the screen */}
                    <div className="fixed inset-0 pointer-events-none z-[-1]">
                        <Confetti
                            width={windowDimension.width}
                            height={windowDimension.height}
                            recycle={false}
                            numberOfPieces={200}
                            gravity={0.15}
                            drawShape={drawGhanaFlag}
                            wind={0.01}
                        />
                    </div>

                    {/* Image container coming up from the bottom */}
                    <motion.div
                        initial={{ y: '100vh', opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: '100vh', opacity: 0, scale: 0.8 }}
                        transition={{
                            type: 'spring',
                            damping: 15,
                            stiffness: 100,
                            delay: 0.2
                        }}
                        className="relative max-w-lg w-full max-h-[90vh] flex flex-col items-center justify-center cursor-auto"
                        onClick={(e) => e.stopPropagation()} // Prevent clicking the image from closing
                    >
                        <img
                            src="/ghana_month_social_post.png"
                            alt="Happy Independence Day Ghana"
                            className="w-full h-auto object-contain rounded-xl shadow-2xl border-2 border-primary/20"
                        />

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5 }}
                            onClick={handleClose}
                            className="absolute -bottom-16 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 rounded-full px-8 py-3 font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                            Continue to PennyPal
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default IndependenceDaySplash;
