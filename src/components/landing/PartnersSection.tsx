import { Building2, Handshake, Code, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const b2bBenefits = [
    {
        icon: Building2,
        title: 'Reach Engaged Earners',
        description: 'Advertise your fintech or crypto platform directly to thousands of Ghanaians actively managing and growing their wealth on Penny Pal.',
    },
    {
        icon: Code,
        title: 'API Integration (Coming Soon)',
        description: 'Connect your services directly into the Penny Pal dashboard. Let users fund wallets or buy assets without leaving the app.',
    },
    {
        icon: Handshake,
        title: 'Strategic Partnerships',
        description: 'We co-create financial education content and exclusive savings challenges with our partners to drive verified user acquisition.',
    },
];

export const PartnersSection = () => {
    return (
        <section className="py-24 md:py-32 bg-slate-950 text-slate-50 relative overflow-hidden">
            {/* Dark mode background decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-slate-950 to-slate-950 -z-10" />

            <div className="container px-4 md:px-6 space-y-24">

                {/* --- B2B / Advertising Pitch --- */}
                <div className="max-w-6xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden relative">

                    {/* Inner glow */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 p-8 md:p-12 gap-12 items-center relative z-10">
                        {/* Left Side: Copy */}
                        <div className="space-y-6">
                            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                                For Businesses & Advertisers
                            </span>
                            <h2 className="text-3xl md:text-4xl font-bold">
                                Grow with Ghana's smartest consumers.
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Penny Pal isn't just an app; it's a community of financially literate Ghanaians actively looking for better ways to save, invest, and transact. Partner with us to put your platform in front of the right audience.
                            </p>

                            <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                                    onClick={() => window.location.href = 'mailto:hello@mypennypal.com'}
                                >
                                    Become a Partner <ArrowRight className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="gap-2 border-slate-700 hover:bg-slate-800 text-foreground"
                                    asChild
                                >
                                    <Link to="/insights">Read Our Research</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Right Side: Benefits List */}
                        <div className="space-y-6">
                            {b2bBenefits.map((benefit, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-800">
                                    <div className="mt-1 w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                        <benefit.icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-200 mb-1">{benefit.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{benefit.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};
