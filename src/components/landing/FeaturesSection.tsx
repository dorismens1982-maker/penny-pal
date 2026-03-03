import {
    LineChart,
    Wallet,
    ShieldCheck,
    Smartphone,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';

const features = [
    {
        icon: Wallet,
        title: 'Smart Expense Tracking',
        description: 'Effortlessly log income and expenses in cedis. Auto-categorize transactions so you always know where every pesewa goes.',
        color: 'text-primary',
        bg: 'bg-primary/10',
        tag: 'Core'
    },
    {
        icon: LineChart,
        title: 'Visual Analytics',
        description: 'Beautiful charts and spending trend graphs help you spot patterns, cut waste, and hit your savings goals faster.',
        color: 'text-income',
        bg: 'bg-income/10',
        tag: 'Insights'
    },
    {
        icon: ShieldCheck,
        title: 'Enterprise-Grade Security',
        description: 'Bank-level encryption and privacy-by-design mean your financial data stays yours — trusted by individuals and B2B partners alike.',
        color: 'text-accent',
        bg: 'bg-accent/10',
        tag: 'Security'
    },
    {
        icon: Smartphone,
        title: 'Works Offline Too',
        description: 'Built as a progressive web app (PWA). Track transactions anywhere — even without internet — and sync when back online.',
        color: 'text-expense',
        bg: 'bg-expense/10',
        tag: 'Mobile'
    }
];

const stats = [
    { icon: Users, value: '10,000+', label: 'Active Users' },
    { icon: TrendingUp, value: '₵2M+', label: 'Transactions Tracked' },
    { icon: Zap, value: '99.9%', label: 'Uptime SLA' },
];

export const FeaturesSection = () => {
    return (
        <section className="py-20 md:py-32 bg-muted/30">
            <div className="container px-4 md:px-6 space-y-16">

                {/* Section Header */}
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary/80 bg-primary/10 px-3 py-1 rounded-full">
                        Why Penny-Pal
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                        Everything you need to master your money
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Whether you're a student budgeting your allowance, a professional tracking investments,
                        or a fintech company looking to embed financial tools — Penny-Pal is built for you.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                        >
                            <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 bg-muted/50 px-2 py-0.5 rounded-full">
                                {feature.tag}
                            </span>
                            <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    {stats.map((stat, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 p-5 rounded-2xl bg-card border border-border/40 text-center">
                            <stat.icon className="w-5 h-5 text-primary mb-1" />
                            <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};
