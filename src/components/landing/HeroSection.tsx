import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { APP_NAME } from '@/config/app';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
    onGetStarted: () => void;
    videoSrc?: string;
    posterSrc?: string;
}

export const HeroSection = ({ onGetStarted, videoSrc, posterSrc }: HeroSectionProps) => {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 -z-10" />
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl -z-10" />

            <div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-8 animate-fade-in-up">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary-dark">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Ghana's Smart Finance Platform
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter max-w-4xl mx-auto">
                    Take control of your
                    <span className="block mt-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        financial future
                    </span>
                </h1>

                {/* Trust line and Video */}
                <div className="flex flex-col items-center w-full gap-8 mt-4">
                    <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5 justify-center">
                        <span>🔒</span>
                        Free to use &nbsp;·&nbsp; No credit card needed &nbsp;·&nbsp; Built for Ghana
                    </p>

                    {/* Hero Image or Video */}
                    <div className="relative w-full max-w-5xl mx-auto perspective-1000">
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 transform rotate-x-6 hover:rotate-x-0 transition-transform duration-700 ease-out group">
                            {videoSrc ? (
                                <div className="relative w-full h-auto max-h-[500px] bg-black">
                                    <video
                                        src={videoSrc}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        poster={posterSrc}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" />
                                </div>
                            ) : (
                                <>
                                    <img
                                        src="/hero-image.png"
                                        alt="Happy Ghanaian using Penny Pal"
                                        className="w-full h-auto object-cover max-h-[500px]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mt-8">
                    {APP_NAME} is Ghana's personal finance platform built for everyday users who want control over their money,
                    and for fintech companies ready to embed best-in-class budgeting tools into their products.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-6 mb-8">
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
                        onClick={() => navigate('/guide')}
                    >
                        Learn More
                    </Button>
                </div>
            </div>
        </section>
    );
};
