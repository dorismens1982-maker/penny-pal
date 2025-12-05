import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { APP_NAME } from '@/config/app';

interface HeroSectionProps {
    onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 -z-10" />
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl -z-10" />

            <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary-dark">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Make every penny count
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter max-w-4xl mx-auto">
                    Manage your money with
                    <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {APP_NAME}
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                    The smart, simple way to track expenses, set budgets, and achieve your financial goals.
                    Start your journey to financial freedom today.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <Button
                        size="lg"
                        className="w-full sm:w-auto min-w-[200px] h-14 text-lg gap-2 shadow-primary hover:shadow-lg transition-all hover:scale-105"
                        onClick={onGetStarted}
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto min-w-[200px] h-14 text-lg"
                    >
                        Learn More
                    </Button>
                </div>

                {/* Hero Image */}
                <div className="relative w-full max-w-5xl mx-auto mt-12 perspective-1000">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 transform rotate-x-6 hover:rotate-x-0 transition-transform duration-700 ease-out group">
                        <img
                            src="/hero-image.png"
                            alt="Happy Ghanaian using Penny-Pal"
                            className="w-full h-auto object-cover max-h-[500px]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                            <p className="font-medium text-lg drop-shadow-md">Empowering Ghanaians to build wealth 🇬🇭</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
