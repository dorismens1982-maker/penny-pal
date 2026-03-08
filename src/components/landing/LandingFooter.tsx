import { Link } from 'react-router-dom';
import { APP_NAME } from '@/config/app';
import {
    Linkedin,
    Github,
    Mail,
    MapPin,
    Shield,
    Sparkles,
    Instagram,
    Send
} from 'lucide-react';

const XIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.45 4.39-3.56 5.3-2.31 1-5.11.66-7.07-.94-1.91-1.57-2.73-4.26-2.03-6.59.62-2.05 2.5-3.64 4.64-4.1 1.65-.35 3.39-.14 4.9.61v4.14c-1.04-.6-2.39-.68-3.48-.15-.99.49-1.59 1.58-1.54 2.68.04 1.11.83 2.08 1.88 2.41 1.48.46 3.19-.07 4.04-1.34.54-.8.78-1.78.76-2.73V.02h-2.55z" />
    </svg>
);

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
        { label: 'Contact', href: 'mailto:hello@mypennypal.com' },
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
    { icon: XIcon, label: 'X', href: 'https://x.com/pennypalhq' },
    { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/pennypalhq/' },
    { icon: TikTokIcon, label: 'TikTok', href: 'https://www.tiktok.com/@pennypalhq' },
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
                            and build wealth in cedis, designed for you.
                        </p>

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
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                        <span>Built by SAM THE CREATOR &nbsp;·&nbsp; © {year} {APP_NAME}. All rights reserved.</span>
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
