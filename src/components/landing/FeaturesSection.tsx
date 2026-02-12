import {
    LineChart,
    Wallet,
    ShieldCheck,
    Smartphone
} from 'lucide-react';

const features = [
    {
        icon: Wallet,
        title: 'Smart Tracking',
        description: 'Effortlessly log income and expenses. Categorize transactions to see exactly where your money goes.',
        color: 'text-primary',
        bg: 'bg-primary/10'
    },
    {
        icon: LineChart,
        title: 'Visual Analytics',
        description: 'Visualize your spending habits with beautiful charts and graphs. Spot trends and adjust your budget.',
        color: 'text-income',
        bg: 'bg-income/10'
    },
    {
        icon: ShieldCheck,
        title: 'Secure & Private',
        description: 'Your financial data is yours alone. We prioritize security and privacy with enterprise-grade protection.',
        color: 'text-accent',
        bg: 'bg-accent/10'
    },
    {
        icon: Smartphone,
        title: 'Mobile First',
        description: 'Designed for your phone. Access your dashboard anywhere, anytime with our PWA support.',
        color: 'text-expense',
        bg: 'bg-expense/10'
    }
];

export const FeaturesSection = () => {
    return (
        <section className="py-20 md:py-32 bg-muted/30">
            <div className="container px-4 md:px-6">
                {/* Features Grid */}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                        >
                            <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
