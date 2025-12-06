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
        bottomCategory?: string;
        bottomCategoryAmount?: number;
    } | null;
}

export const MonthlyRecapModal = ({ open, onClose, data }: MonthlyRecapModalProps) => {
    const size = useWindowSizeHook();

    if (!data) return null;

    const monthName = new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long' });
    const isSavingsPositive = data.saved > 0;
    const isSpendingDown = data.spendingTrend < 0;

    // Mood Logic
    const moodImage = isSavingsPositive ? '/recap_happy.jpg' : '/recap_sad.png';
    const moodHeadline = isSavingsPositive ? "Money Moves! 🚀" : "We Move, Regardless. 💪";
    const moodSubhead = isSavingsPositive
        ? "You saved more than you spent. The soft life is loading."
        : "Expenses were higher this month. Next month is a fresh start.";
    const moodButtonText = isSavingsPositive ? "Keep Flowing" : "We Go Again";
    const moodColor = isSavingsPositive ? 'text-yellow-600' : 'text-slate-900';

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-none shadow-2xl text-slate-900 transition-all duration-300">

                {/* Confetti only for winners */}
                {isSavingsPositive && open && (
                    <div className="absolute inset-0 z-50 pointer-events-none">
                        <Confetti
                            width={size.width}
                            height={size.height}
                            numberOfPieces={150}
                            recycle={false}
                            colors={['#EAB308', '#F59E0B', '#FCD34D', '#FFF']}
                        />
                    </div>
                )}

                <div className="relative h-[85vh] max-h-[750px] flex flex-col">

                    {/* Hero Image Section (Fixed Top) */}
                    <div className="h-[45%] w-full relative bg-white flex items-center justify-center">
                        <img
                            src={moodImage}
                            alt={isSavingsPositive ? "Happy Manager" : "Stressed Manager"}
                            className="w-full h-full object-contain"
                        />
                    </div>

                    {/* Sliding Card Content */}
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, type: 'spring', damping: 20 }}
                        className="flex-1 bg-white border-t border-slate-100 relative z-20 flex flex-col shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden"
                    >
                        {/* Header Decoration (Fixed) */}
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2 flex-shrink-0" />

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto px-6 pb-4 custom-scrollbar">

                            {/* Title Section */}
                            <div className="text-center mb-6">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">📅 {monthName} {data.year} Report</p>
                                <h2 className={`text-2xl font-bold font-poppins mb-2 ${moodColor}`}>{moodHeadline}</h2>
                                <p className="text-sm text-slate-500">{moodSubhead}</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">💰 Income</p>
                                    <p className="font-bold text-lg text-slate-900">₵{data.income.toFixed(0)}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">💸 Expenses</p>
                                    <p className="font-bold text-lg text-slate-900">₵{data.expenses.toFixed(0)}</p>
                                </div>
                            </div>

                            {/* Spending Insights */}
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">📊 Spending Breakdown</p>

                                {/* Biggest Drain */}
                                {data.topCategory && (
                                    <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-3">
                                        <div className="text-2xl">🔥</div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-red-500 uppercase">Biggest Drain</p>
                                            <p className="text-sm font-bold text-slate-900">{data.topCategory}</p>
                                        </div>
                                        <p className="text-sm font-bold text-red-500">₵{data.topCategoryAmount?.toFixed(0)}</p>
                                    </div>
                                )}

                                {/* Best Discipline */}
                                {data.bottomCategory && (
                                    <div className="bg-green-50 border border-green-100 p-3 rounded-xl flex items-center gap-3">
                                        <div className="text-2xl">✅</div>
                                        <div className="flex-1">
                                            <p className="text-xs font-medium text-green-600 uppercase">Best Discipline</p>
                                            <p className="text-sm font-bold text-slate-900">{data.bottomCategory}</p>
                                        </div>
                                        <p className="text-sm font-bold text-green-600">₵{data.bottomCategoryAmount?.toFixed(0)}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Button (Fixed) */}
                        <div className="p-6 pt-2 bg-white border-t border-slate-50 flex-shrink-0">
                            <Button
                                className={`w-full h-12 rounded-xl font-bold text-white ${isSavingsPositive
                                    ? 'bg-yellow-500 hover:bg-yellow-600 shadow-lg shadow-yellow-500/20'
                                    : 'bg-slate-900 hover:bg-slate-800'
                                    }`}
                                onClick={onClose}
                            >
                                {moodButtonText}
                            </Button>
                        </div>

                    </motion.div>
                </div>

            </DialogContent>
        </Dialog>
    );
};
