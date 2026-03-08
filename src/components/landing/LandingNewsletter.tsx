import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, Mail, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const LandingNewsletter = () => {
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const { toast } = useToast();

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubscribing(true);
        try {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert([{ email }]);

            if (error) {
                if (error.code === '23505') {
                    toast({
                        title: "Already Subscribed",
                        description: "You're already on our list! Stay tuned for updates.",
                        variant: "destructive"
                    });
                } else {
                    toast({
                        title: "Subscription Error",
                        description: "Something went wrong. Please try again later.",
                        variant: "destructive"
                    });
                    console.error("Newsletter error:", error);
                }
            } else {
                toast({
                    title: "Success! 🚀",
                    description: "Thanks for subscribing! Check your inbox for a welcome surprise.",
                });
                setEmail('');

                // Welcome Email Edge Function Invocation
                supabase.functions.invoke('send-newsletter-welcome-email', {
                    body: { email }
                }).catch(err => console.error("Error triggering welcome email:", err));
            }
        } catch (err) {
            toast({
                title: "Unexpected Error",
                description: "An unexpected error occurred. Please try again.",
                variant: "destructive"
            });
            console.error(err);
        } finally {
            setIsSubscribing(false);
        }
    };

    return (
        <section className="py-24 md:py-32 relative overflow-hidden group">
            {/* Premium Background Elements */}
            <div className="absolute inset-0 bg-background pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[140px] translate-y-1/2 pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-16 relative z-20 overflow-hidden shadow-2xl">
                        {/* Inner Glow/Gradient */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-in fade-in slide-in-from-bottom-3 duration-1000">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Weekly Financial Insights</span>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                                        Join our exclusive <br />
                                        <span className="text-primary italic">Penny Pal</span> circle
                                    </h2>
                                    <p className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 leading-relaxed">
                                        Get the latest market insights, platform updates, and wealth-building tips delivered straight to your inbox.
                                    </p>
                                </div>

                                <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="p-2 rounded-lg bg-background/50 border border-border/50">
                                            <Bell className="w-4 h-4 text-primary" />
                                        </div>
                                        <span>Instant Updates</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="p-2 rounded-lg bg-background/50 border border-border/50">
                                            <Mail className="w-4 h-4 text-primary" />
                                        </div>
                                        <span>Premium Content</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                {/* Form Wrapper with glass effect */}
                                <div className="bg-background/30 p-2 rounded-2xl border border-white/5 shadow-inner">
                                    <form onSubmit={handleSubscribe} className="relative flex flex-col gap-3">
                                        <div className="relative group/input">
                                            <div className="absolute inset-0 bg-primary/20 blur-md opacity-0 group-focus-within/input:opacity-100 transition-opacity rounded-xl pointer-events-none" />
                                            <Input
                                                type="email"
                                                placeholder="Enter your email address"
                                                required
                                                className="bg-background/80 h-16 rounded-xl border-border/50 focus:border-primary/50 focus:ring-primary/20 text-lg pl-6 pr-12 transition-all"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={isSubscribing}
                                            size="lg"
                                            className="h-16 rounded-xl text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 group/btn overflow-hidden relative"
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                {isSubscribing ? 'Joining...' : 'Subscribe Now'}
                                                <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                        </Button>
                                    </form>
                                </div>

                                <p className="mt-4 text-center text-xs text-muted-foreground">
                                    By subscribing, you agree to our <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>. No spam, ever.
                                </p>

                                {/* Background decorative blob for the form side */}
                                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/20 rounded-full blur-[60px] -z-10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
