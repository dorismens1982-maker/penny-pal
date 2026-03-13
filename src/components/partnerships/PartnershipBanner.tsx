import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BadgeCheck } from 'lucide-react';

interface PartnershipBannerProps {
    partnerName?: string;
    partnerLogoUrl?: string;
    theme?: 'dark' | 'light' | 'primary';
    className?: string;
}

export const PartnershipBanner: React.FC<PartnershipBannerProps> = ({
    partnerName = 'Your Brand Here',
    partnerLogoUrl,
    theme = 'dark',
    className = '',
}) => {
    const getThemeStyles = () => {
        switch (theme) {
            case 'primary':
                return 'bg-primary text-primary-foreground border-primary-foreground/20';
            case 'light':
                return 'bg-white text-slate-900 border-slate-200';
            case 'dark':
            default:
                return 'bg-slate-900 text-white border-slate-800';
        }
    };

    const isPlaceholder = partnerName === 'Your Brand Here';

    return (
        <Card className={`overflow-hidden border shadow-sm transition-all hover:shadow-md ${getThemeStyles()} ${className}`}>
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 gap-6">

                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        {/* Logo Area */}
                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 backdrop-blur-sm overflow-hidden">
                            {partnerLogoUrl ? (
                                <img src={partnerLogoUrl} alt={partnerName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-2xl font-bold opacity-50">?</div>
                            )}
                        </div>

                        {/* Copy Area */}
                        <div>
                            {isPlaceholder ? (
                                <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
                                    <BadgeCheck className="w-4 h-4 text-primary" />
                                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">Partnership Opportunity</span>
                                </div>
                            ) : (
                                <div className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">
                                    Supported By
                                </div>
                            )}

                            <h3 className="text-xl sm:text-2xl font-bold font-merriweather mb-2">
                                {isPlaceholder ? 'Reach thousands of focused investors' : partnerName}
                            </h3>
                            <p className="opacity-80 max-w-lg text-sm sm:text-base leading-relaxed">
                                {isPlaceholder
                                    ? "Place your brand right where users are actively managing their money and building wealth. Perfect for Crypto, Fintech, and Banking services."
                                    : `Discover how ${partnerName} is helping our users achieve their financial goals securely and efficiently.`}
                            </p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                        <button className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold text-sm transition-all rounded-full bg-white text-slate-900 overflow-hidden hover:scale-105 active:scale-95 shadow-lg">
                            <span className="relative z-10">{isPlaceholder ? 'Partner With Us' : 'Learn More'}</span>
                            <ArrowRight className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-1" />
                            <div className="absolute inset-0 h-full w-full opacity-0 group-hover:opacity-10 bg-black transition-all" />
                        </button>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};
