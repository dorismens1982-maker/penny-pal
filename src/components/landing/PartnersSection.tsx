import { Building2, Handshake, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const partners = [
    {
        name: 'MTN Mobile Money',
        logo: '📱',
        category: 'Mobile Payments',
    },
    {
        name: 'GCB Bank',
        logo: '🏦',
        category: 'Banking',
    },
    {
        name: 'Hubtel',
        logo: '💳',
        category: 'Payment Gateway',
    },
    {
        name: 'Fidelity Bank',
        logo: '🏛️',
        category: 'Banking',
    },
    {
        name: 'AirtelTigo Money',
        logo: '📡',
        category: 'Mobile Payments',
    },
    {
        name: 'Zeepay',
        logo: '🔄',
        category: 'Fintech',
    },
];

const b2bBenefits = [
    {
        icon: Building2,
        title: 'White-Label Ready',
        description: 'Deploy Penny-Pal under your brand. Full customization of colors, logos, and user flows for a seamless experience.',
    },
    {
        icon: Handshake,
        title: 'API Integration',
        description: 'Connect directly to your existing mobile money or banking infrastructure with our clean, documented REST API.',
    },
    {
        icon: Mail,
        title: 'Dedicated Support',
        description: 'A dedicated integration team ensures smooth onboarding, from technical setup to user adoption strategies.',
    },
];

export const PartnersSection = () => {
    return (
        <section className="py-20 md:py-28 bg-background relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background -z-10" />

            <div className="container px-4 md:px-6 space-y-20">

                {/* --- Partners / Supported By --- */}
                <div className="text-center space-y-10">
                    <div className="space-y-3">
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary/80 bg-primary/10 px-3 py-1 rounded-full">
                            Ecosystem
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Built for Ghana's Fintech Landscape
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                            Designed to integrate seamlessly with the payment networks, banks, and digital wallets Ghanaians already rely on.
                        </p>
                    </div>

                    {/* Partner logo grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
                        {partners.map((partner) => (
                            <div
                                key={partner.name}
                                className="group flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border/40 bg-card hover:border-primary/40 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                                title={partner.name}
                            >
                                <span className="text-3xl" role="img" aria-label={partner.name}>
                                    {partner.logo}
                                </span>
                                <span className="text-[11px] font-medium text-muted-foreground text-center leading-tight">
                                    {partner.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded-full">
                                    {partner.category}
                                </span>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm text-muted-foreground italic">
                        Partner logos shown are illustrative. Official integrations coming soon.
                    </p>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                {/* --- B2B Section --- */}
                <div className="space-y-12">
                    <div className="text-center space-y-3">
                        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-accent/80 bg-accent/10 px-3 py-1 rounded-full">
                            For Businesses
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Partner With Penny-Pal
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                            Offer your customers best-in-class financial management tools. Integrate Penny-Pal into your product or co-brand for your user base.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {b2bBenefits.map((benefit, i) => (
                            <div
                                key={i}
                                className="relative group p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                            >
                                {/* Glow effect */}
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <benefit.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col items-center gap-4 pt-4">
                        <p className="text-muted-foreground text-sm">Interested in a partnership or custom integration?</p>
                        <Button
                            size="lg"
                            variant="outline"
                            className="gap-2 border-primary/40 hover:border-primary hover:bg-primary/5 transition-all"
                            onClick={() => window.location.href = 'mailto:partners@penny-pal.com'}
                        >
                            <Mail className="w-4 h-4" />
                            Contact Our Partnership Team
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};
