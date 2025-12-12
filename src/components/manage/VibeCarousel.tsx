import React from 'react';
import { getCloudinaryUrl } from '@/utils/cloudinary';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VibeCardProps {
    image: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
}

const VibeCard = ({ image, title, subtitle, icon, color }: VibeCardProps) => (
    <motion.div
        className="relative min-w-[280px] md:min-w-[320px] h-40 md:h-48 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow"
        whileHover={{ y: -2 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
    >
        {/* Background Image */}
        <div className="absolute inset-0">
            <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 p-4 w-full">
            <div className={`mb-2 inline-flex items-center justify-center p-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 ${color}`}>
                {icon}
            </div>
            <h3 className="text-white font-bold text-lg md:text-xl leading-tight">{title}</h3>
            <p className="text-white/80 text-xs md:text-sm mt-1 line-clamp-2">{subtitle}</p>
        </div>

        {/* Hover Action */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                <ArrowRight className="w-4 h-4 text-white" />
            </div>
        </div>
    </motion.div>
);

export const VibeCarousel = () => {
    const vibes = [
        {
            id: 1,
            image: getCloudinaryUrl('vibe_freedom.png'),
            title: 'Financial Freedom',
            subtitle: 'Visualize the life you want to live.',
            icon: <Sparkles className="w-4 h-4 text-sky-300" />,
            color: 'text-sky-300'
        },
        {
            id: 2,
            image: getCloudinaryUrl('vibe_growth.png'),
            title: 'Smart Growth',
            subtitle: 'Watch your savings bloom every day.',
            icon: <TrendingUp className="w-4 h-4 text-emerald-300" />,
            color: 'text-emerald-300'
        },
        {
            id: 3,
            image: getCloudinaryUrl('vibe_goal.png'),
            title: 'Celebrate Wins',
            subtitle: 'Big or small, every step forward counts.',
            icon: <Zap className="w-4 h-4 text-amber-300" />,
            color: 'text-amber-300'
        },
        {
            id: 4,
            image: getCloudinaryUrl('vibe_strategic_wealth.jpg'),
            title: 'Strategic Wealth',
            subtitle: 'Plan ahead for a secure future.',
            icon: <Target className="w-4 h-4 text-purple-300" />,
            color: 'text-purple-300'
        }
    ];

    return (
        <div className="w-full overflow-x-auto pb-4 pt-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <div className="flex gap-4 w-max">
                {vibes.map((vibe) => (
                    <VibeCard key={vibe.id} {...vibe} />
                ))}
            </div>
        </div>
    );
};
