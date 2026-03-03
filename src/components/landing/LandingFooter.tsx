import { Link } from 'react-router-dom';
import { APP_NAME } from '@/config/app';
import {
    Twitter,
    Linkedin,
    Github,
    Mail,
    MapPin,
    Shield,
    Sparkles
} from 'lucide-react';

const footerLinks = {
    Product: [
        { label: 'Features', href: '/#features' },
        { label: 'How It Works', href: '/guide' },
        { label: 'Blog', href: '/blog' },
        { label: 'Changelog', href: '/about#changelog' },
    ],
    Company: [
        { label: 'About Us', href: '/about' },
        { label: 'Partners', href: '/#partners' },
        { label: 'Contact', href: 'mailto:hello@penny-pal.com' },
    ],
    Legal: [
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Cookie Policy', href: '/cookies' },
        { label: 'Data & Security', href: '/privacy#security' },
    ],
    Support: [
        { label: 'Help Centre', href: '/guide' },
        { label: 'FAQ', href: '/guide#troubleshooting' },
        { label: 'Community', href: '/blog' },
        { label: 'Status Page', href: '#' },
    ],
};

const socials = [
    { icon: Twitter, label: 'X / Twitter', href: 'https://twitter.com/pennypalgha' },
    { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/company/penny-pal' },
    { icon: Github, label: 'GitHub', href: 'https://github.com/penny-pal' },
    { icon: Mail, label: 'Email', href: 'mailto:hello@penny-pal.com' },
];

const isExternal = (href: string) => href.startsWith('http') || href.startsWith('mailto:');

export const LandingFooter = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-card border-t border-border/60 relative overflow-hidden">
            {/* Subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">

                {/* Top row — brand + links */}
                <div className="py-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">

                    {/* Brand column — spans 2 on lg */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-2 space-y-5">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                                <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">{APP_NAME}</span>
                        </Link>

                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                            Ghana's personal finance platform. Track expenses, set budgets,
                            and build wealth — in cedis, designed for you.
                        </p>

                        {/* Trust badges */}
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/60 border border-border/50 px-3 py-1.5 rounded-full">
                                <Shield className="w-3 h-3 text-green-500" />
                                Bank-level Encryption
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/60 border border-border/50 px-3 py-1.5 rounded-full">
                                <Sparkles className="w-3 h-3 text-primary" />
                                GDPR Compliant
                            </span>
                        </div>

                        {/* Socials */}
                        <div className="flex items-center gap-2 pt-1">
                            {socials.map(({ icon: Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target={href.startsWith('http') ? '_blank' : undefined}
                                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    aria-label={label}
                                    className="w-9 h-9 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 hover:scale-110"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category} className="col-span-1 space-y-4">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground/60">
                                {category}
                            </h3>
                            <ul className="space-y-3">
                                {links.map(({ label, href }) => (
                                    <li key={label}>
                                        {isExternal(href) ? (
                                            <a
                                                href={href}
                                                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                                            >
                                                {label}
                                            </a>
                                        ) : (
                                            <Link
                                                to={href}
                                                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                                            >
                                                {label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="py-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" />
                        <span>Made with ❤️ in Accra, Ghana &nbsp;·&nbsp; © {year} {APP_NAME}. All rights reserved.</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
