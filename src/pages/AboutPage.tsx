import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME } from '@/config/app';
import { Button } from '@/components/ui/button';
import { LandingFooter } from '@/components/landing/LandingFooter';
import {
    ArrowLeft,
    Target,
    Heart,
    Zap,
    ShieldCheck,
    ArrowRight
} from 'lucide-react';

const values = [
    { icon: Heart, title: 'People First', description: 'Every feature we build starts with the question: "Does this empower our community?"', color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { icon: Target, title: 'Radical Transparency', description: 'We say what we do and do what we say — in the product, in pricing, and in privacy.', color: 'text-primary', bg: 'bg-primary/10' },
    { icon: Zap, title: 'Local Context, Global Vision', description: 'Built for the realities of Ghana first, designed with a vision that scales across Africa.', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: ShieldCheck, title: 'Security Always', description: 'We treat your financial data with enterprise-grade encryption. No shortcuts.', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
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
                            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
                                <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
                            </div>
                            <span className="font-bold text-lg tracking-tight hidden sm:block">{APP_NAME}</span>
                        </Link>
                    </div>
                    <Button size="sm" onClick={() => navigate('/auth')}>Get Started</Button>
                </div>
            </nav>

            {/* Clean White Hero */}
            <section className="relative py-24 md:py-32 overflow-hidden bg-background">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

                <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center space-y-8">
                    <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
                        Our Story
                    </span>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-foreground">
                        Simplifying finance <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">for everyone</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        We believe managing your money shouldn't require a finance degree. We're building intuitive, smart tools to help you track spending, set goals, and achieve financial clarity.
                    </p>
                </div>
            </section>

            {/* Values / Origin Story */}
            <section className="py-20 md:py-32 bg-muted/30 border-y border-border/50">
                <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                        <div className="lg:col-span-2 space-y-6 lg:pr-8">
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Why we built {APP_NAME}</h2>
                            <div className="w-20 h-1 bg-primary rounded-full" />
                            <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                                <p>
                                    Most financial tools rely on assumptions that don't apply to our daily realities. They ignore mobile money, informal markets, and local context.
                                </p>
                                <p>
                                    We designed an ecosystem that understands how you transact, embraces new technologies, and helps everyday people build wealth thoughtfully.
                                </p>
                            </div>
                        </div>

                        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
                            {values.map(({ icon: Icon, title, description, color, bg }) => (
                                <div key={title} className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                                    <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center mb-6`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-xl mb-3">{title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Simple Community CTA */}
            <section className="py-20 md:py-24 bg-background text-center">
                <div className="container px-4 md:px-6 max-w-3xl mx-auto space-y-8">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Ready to take control?</h2>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                        Join thousands of users who are already building better financial habits with {APP_NAME}.
                    </p>
                    <Button size="lg" className="h-12 px-8 text-base gap-2" onClick={() => navigate('/auth')}>
                        Start Your Journey <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </section>

            <LandingFooter />
        </div>
    );
};

export default AboutPage;
