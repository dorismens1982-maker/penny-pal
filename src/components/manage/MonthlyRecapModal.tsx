import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, TrendingUp, Wallet, Award, Share2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

// Simple hook for window size if no library is preferred, but react-confetti usually needs width/height
const useWindowSizeHook = () => {
    const [size, setSize] = React.useState({ width: window.innerWidth, height: window.innerHeight });
    React.useEffect(() => {
        const handleResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return size;
};

interface MonthlyRecapModalProps {
    open: boolean;
    onClose: () => void;
    data: {
        month: number;
        year: number;
        income: number;
        expenses: number;
        saved: number;
        spendingTrend: number;
        topCategory?: string;
        topCategoryAmount?: number;
    } | null;
}

export const MonthlyRecapModal = ({ open, onClose, data }: MonthlyRecapModalProps) => {
    const size = useWindowSizeHook();

    if (!data) return null;

    const monthName = new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long' });
    const isSavingsPositive = data.saved > 0;
    const isSpendingDown = data.spendingTrend < 0;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-transparent border-none shadow-none text-foreground">

                {/* Confetti for positive savings */}
                {isSavingsPositive && open && (
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <Confetti
                            width={size.width}
                            height={size.height}
                            numberOfPieces={200}
                            recycle={false}
                            colors={['#EAB308', '#F59E0B', '#FCD34D', '#FFF']}
                        />
                    </div>
                )}

                <div className="relative bg-background/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

                    {/* Decorative Gradients */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-500/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />

                    {/* Header */}
                    <div className="pt-8 pb-4 text-center relative z-10">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl shadow-lg shadow-yellow-500/20 mb-4"
                        >
                            <Award className="w-8 h-8 text-white stroke-[2.5]" />
                        </motion.div>
                        <motion.h2
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80"
                        >
                            {monthName} Recap
                        </motion.h2>
                        <motion.p
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm text-muted-foreground mt-1"
                        >
                            Your financial performance report
                        </motion.p>
                    </div>

                    {/* Report Cards Carousel */}
                    <div className="p-6 space-y-4 relative z-10">

                        {/* 1. Trend Card */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 p-4 hover:border-yellow-500/30 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${isSpendingDown ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                                        {isSpendingDown ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Spend Trend</p>
                                        <p className="font-bold text-lg">
                                            {Math.abs(data.spendingTrend).toFixed(1)}% {isSpendingDown ? 'Down' : 'Up'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* 2. Top Category Card */}
                        {data.topCategory && (
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/10 border border-white/10 p-4 hover:border-yellow-500/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-500">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Top Spend</p>
                                        <div className="flex items-baseline justify-between">
                                            <p className="font-bold text-lg">{data.topCategory}</p>
                                            <p className="text-sm font-medium text-muted-foreground">₵{data.topCategoryAmount?.toFixed(0)}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 3. Net Savings Card (Hero) */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className={`rounded-2xl p-5 border ${isSavingsPositive ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/20' : 'bg-red-500/5 border-red-500/20'}`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <p className="text-sm font-medium text-muted-foreground mb-1">Net Savings</p>
                                <h3 className={`text-3xl font-black font-poppins ${isSavingsPositive ? 'text-yellow-500' : 'text-red-500'}`}>
                                    {isSavingsPositive ? '+' : ''}₵{data.saved.toFixed(2)}
                                </h3>
                                <div className="mt-3 flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-background/50 border border-border/50">
                                    {isSavingsPositive ? <Sparkles className="w-3 h-3 text-yellow-500" /> : <Wallet className="w-3 h-3" />}
                                    {isSavingsPositive ? 'You crushed it!' : 'Next month will be better.'}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-2">
                        <Button
                            className="w-full h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-bold shadow-lg shadow-yellow-500/25 transition-all active:scale-[0.98]"
                            onClick={onClose}
                        >
                            Awesome, Let's Go! 🚀
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

