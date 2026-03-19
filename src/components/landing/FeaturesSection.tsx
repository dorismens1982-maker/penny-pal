import {
    LineChart,
    Wallet,
    ShieldCheck,
    Smartphone,
    TrendingUp,
    Users,
    Zap,
    FolderLock,
    MessageSquare,
    Mic
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const FeaturesSection = () => {
    return (
        <section className="py-20 md:py-32 bg-background relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10 space-y-16">

                {/* Section Header */}
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary/80 bg-primary/10 px-3 py-1 rounded-full">
                        The Hub
                    </span>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                        Everything you need, <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-brand">in one ecosystem.</span>
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Penny Pal brings together powerful tracking, secure digital asset storage, and a vibrant community into a single, seamless platform.
                    </p>
                </div>

                {/* Bento Box Layout */}
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">

                    {/* BENTO 1: Large Feature (Tracker/Analytics) */}
                    <div className="md:col-span-2 md:row-span-2 group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl overflow-hidden flex flex-col justify-between">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none transition-transform duration-500 group-hover:scale-110" />

                        <div className="space-y-4 relative z-10 max-w-md">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                                <LineChart className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold">Intelligent Expense Tracking</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Built for the realities of Ghana's economy. Log mobile money, cash, and bank transactions effortlessly. Auto-categorize your spending and visualize exactly where every cedi goes.
                            </p>
                            <div className="pt-4 flex gap-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                                    <Smartphone className="w-4 h-4 text-primary" /> Multi-device
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                                    <Zap className="w-4 h-4 text-income" /> Fast Logging
                                </div>
                            </div>
                        </div>

                        {/* Decorative Graphic area (mocking an interface fragment) */}
                        <div className="mt-8 relative h-32 w-full rounded-tr-2xl rounded-bl-2xl bg-gradient-to-br from-background to-muted border border-border/50 overflow-hidden hidden sm:block">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,white,transparent)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
                            {/* Abstract chart lines */}
                            <svg className="absolute w-full h-full bottom-0" viewBox="0 0 500 100" preserveAspectRatio="none">
                                <path d="M0,100 L0,50 Q100,20 200,60 T400,30 L500,40 L500,100 Z" fill="url(#grad1)" opacity="0.1" />
                                <path d="M0,100 L0,50 Q100,20 200,60 T400,30 L500,40" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary opacity-50" />
                                <defs>
                                    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="currentColor" className="text-primary" />
                                        <stop offset="100%" stopColor="transparent" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </div>

                    {/* BENTO 2: Neural Vault */}
                    <div className="group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-xl overflow-hidden flex flex-col justify-between">
                        <div className="space-y-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                                <FolderLock className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">Digital Asset Vault</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Never lose important digital receipts, links, or documents again. Securely store and organize your financial files in the cloud.
                            </p>
                        </div>
                        <div className="mt-6">
                            <ShieldCheck className="w-8 h-8 text-muted-foreground/30 absolute bottom-6 right-6 group-hover:text-accent/20 transition-colors" />
                        </div>
                    </div>

                    {/* BENTO 3: Community */}
                    <div className="group relative p-8 rounded-3xl bg-card border border-border/50 hover:border-income/50 transition-all duration-300 hover:shadow-xl overflow-hidden flex flex-col justify-between">
                        <div className="space-y-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-income/10 text-income flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">Community Hub</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Join active discussions. Share savings strategies, learn from others, and interact directly with our deep-dive blog posts.
                            </p>
                        </div>
                        <div className="mt-6 flex -space-x-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[10px] font-bold">JD</div>
                            <div className="w-8 h-8 rounded-full bg-accent/20 border-2 border-card flex items-center justify-center text-[10px] font-bold">SK</div>
                            <div className="w-8 h-8 rounded-full bg-income/20 border-2 border-card flex items-center justify-center text-[10px] font-bold">+</div>
                        </div>
                    </div>

                    {/* BENTO 4: Voice AI (NEW) */}
                    <div className="group relative p-8 rounded-3xl bg-primary/5 border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:shadow-xl overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 p-2">
                            <span className="text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full animate-pulse">NEW</span>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-12">
                                <Mic className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold">Voice-First Logging</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Just talk. Our AI understands your local context and logs your expenses hands-free. "I spent 50 cedis on Jollof" — Done.
                            </p>
                        </div>
                        <div className="mt-6">
                             <div className="h-6 w-full bg-muted rounded-full overflow-hidden relative">
                                 <div className="absolute h-full bg-primary/30 w-1/2 animate-shimmer" />
                                 <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-primary/70">Listening...</div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
