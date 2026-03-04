import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME, COMPANY_NAME } from '@/config/app';
import { Button } from '@/components/ui/button';
import { LandingFooter } from '@/components/landing/LandingFooter';
import {
    ArrowLeft,
    Target,
    Heart,
    Zap,
    Users,
    Globe,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';

const team = [
    {
        name: 'Kofi Mensah',
        role: 'Founder & CEO',
        bio: 'Fintech enthusiast with 8 years building payment infrastructure for West Africa.',
        emoji: '👨🏾‍💼',
    },
    {
        name: 'Abena Osei',
        role: 'Head of Product',
        bio: 'UX designer turned product leader. Obsessed with making finance simple for everyone.',
        emoji: '👩🏾‍🎨',
    },
    {
        name: 'Kwame Asante',
        role: 'Lead Engineer',
        bio: 'Full-stack engineer who loves building fast, reliable, and beautiful software.',
        emoji: '👨🏾‍💻',
    },
    {
        name: 'Ama Boateng',
        role: 'Partnerships & Growth',
        bio: 'Building the bridges between Penny-Pal and Ghana\'s fintech ecosystem.',
        emoji: '👩🏾‍🤝‍👩🏽',
    },
];

const values = [
    { icon: Heart, title: 'People First', description: 'Every feature we build starts with the question: "Does this actually help our users?"', color: 'text-red-500', bg: 'bg-red-500/10' },
    { icon: Target, title: 'Radical Transparency', description: 'We say what we do and do what we say — in the product, in pricing, and in privacy.', color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Zap, title: 'Local + Global', description: 'Built for Ghana first, designed with a vision that extends across all of Africa.', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: ShieldCheck, title: 'Security Always', description: 'We treat your financial data with the same care you would. No shortcuts.', color: 'text-green-500', bg: 'bg-green-500/10' },
];

const milestones = [
    { year: '2024', event: 'Penny-Pal founded in Accra, Ghana', icon: '🚀' },
    { year: 'Q1 2025', event: 'First 1,000 users reach their savings goals', icon: '🎯' },
    { year: 'Q2 2025', event: 'Mobile PWA launched with offline support', icon: '📱' },
    { year: 'Q3 2025', event: 'Passed 5,000 active users milestone', icon: '🏆' },
    { year: 'Q4 2025', event: 'Blog & financial education platform launched', icon: '📚' },
    { year: '2026', event: 'B2B partnerships program announced', icon: '🤝' },
];

const AboutPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1.5">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back</span>
                        </Button>
                        <div className="h-4 w-px bg-border" />
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
                            </div>
                            <span className="font-bold text-lg tracking-tight hidden sm:block">{APP_NAME}</span>
                        </Link>
                    </div>
                    <Button size="sm" onClick={() => navigate('/')}>Get Started</Button>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-br from-background via-background/95 to-primary/5">
                <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl -z-10" />
                <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center space-y-6">
                    <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary/80 bg-primary/10 px-3 py-1 rounded-full">Our Story</span>
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                        Building wealth,<br />
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">one pesewa at a time</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        {APP_NAME} was born from a simple frustration: personal finance apps weren't built for Ghanaians.
                        We're changing that.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 pt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> 10,000+ Users</span>
                        <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-primary" /> Based in Accra</span>
                        <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary" /> Privacy-First</span>
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-16 md:py-20 bg-muted/30">
                <div className="container px-4 md:px-6 max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-5">
                            <h2 className="text-3xl font-bold">Why we built {APP_NAME}</h2>
                            <p className="text-muted-foreground leading-relaxed">
                                Most financial apps were built with US or European users in mind — dollar signs, foreign banks, and assumptions about credit history that simply don't apply to life in Ghana.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                We wanted a tool that thinks in cedis, understands mobile money, and helps everyday Ghanaians — from market traders to software developers — build better financial habits.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                {APP_NAME} is that tool. And we're just getting started.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {values.map(({ icon: Icon, title, description, color, bg }) => (
                                <div key={title} className="p-5 rounded-2xl bg-card border border-border/50 space-y-3">
                                    <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-sm">{title}</h3>
                                    <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-16 md:py-20">
                <div className="container px-4 md:px-6 max-w-5xl mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl font-bold">Meet the team</h2>
                        <p className="text-muted-foreground">A small, passionate team building big things.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {team.map(member => (
                            <div key={member.name} className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center space-y-3">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-3xl mx-auto">
                                    {member.emoji}
                                </div>
                                <div>
                                    <h3 className="font-bold">{member.name}</h3>
                                    <p className="text-xs text-primary font-medium">{member.role}</p>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Milestones */}
            <section id="changelog" className="py-16 md:py-20 bg-muted/30">
                <div className="container px-4 md:px-6 max-w-3xl mx-auto space-y-10">
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl font-bold">Our Journey</h2>
                        <p className="text-muted-foreground">From idea to impact.</p>
                    </div>
                    <div className="relative">
                        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                        <div className="space-y-6">
                            {milestones.map(m => (
                                <div key={m.event} className="relative flex gap-5 pl-14">
                                    <div className="absolute left-0 w-12 h-12 rounded-xl bg-card border border-border/60 flex items-center justify-center text-xl shadow-sm">
                                        {m.icon}
                                    </div>
                                    <div className="space-y-0.5 pb-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-primary/70">{m.year}</p>
                                        <p className="font-medium text-foreground">{m.event}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Careers */}
            <section id="careers" className="py-16 md:py-20">
                <div className="container px-4 md:px-6 max-w-3xl mx-auto text-center space-y-6">
                    <h2 className="text-3xl font-bold">Join the team</h2>
                    <p className="text-muted-foreground text-lg">
                        We're always looking for curious, mission-driven people who want to shape the future of African fintech.
                    </p>
                    <p className="text-muted-foreground">
                        We're a remote-friendly team based in Accra. Open roles are posted on our LinkedIn.
                    </p>
                    <Button size="lg" className="gap-2" onClick={() => window.open('mailto:careers@penny-pal.com', '_blank')}>
                        View Open Roles <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
};

export default AboutPage;
