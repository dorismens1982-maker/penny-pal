import React from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME, COMPANY_NAME } from '@/config/app';
import { ArrowLeft } from 'lucide-react';

interface LegalLayoutProps {
    title: string;
    subtitle: string;
    lastUpdated: string;
    children: React.ReactNode;
}

export const LegalLayout = ({ title, subtitle, lastUpdated, children }: LegalLayoutProps) => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Back</span>
                        </Link>
                        <div className="h-4 w-px bg-border" />
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                                <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
                            </div>
                            <span className="font-bold text-lg tracking-tight hidden sm:block">{APP_NAME}</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <div className="bg-gradient-to-br from-background via-background/95 to-primary/5 border-b border-border/30 py-12 md:py-16">
                <div className="container px-4 md:px-6 max-w-4xl mx-auto space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">Legal</p>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground text-lg">{subtitle}</p>
                    <p className="text-xs text-muted-foreground/60 pt-2">Last updated: {lastUpdated} &nbsp;·&nbsp; {COMPANY_NAME}</p>
                </div>
            </div>

            {/* Content */}
            <main className="flex-1 container px-4 md:px-6 max-w-4xl mx-auto py-12">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-border bg-muted/20">
                <div className="container px-4 text-center text-xs text-muted-foreground space-y-2">
                    <p>© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
                    <div className="flex justify-center gap-4">
                        <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};
