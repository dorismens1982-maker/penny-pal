import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { APP_NAME } from '@/config/app';

export function InstallPWA() {
    const [supportsPWA, setSupportsPWA] = useState(false);
    const [promptInstall, setPromptInstall] = useState<any>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setSupportsPWA(true);
            setPromptInstall(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Don't show if already installed (standalone mode) or user dismissed it this session
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
            setSupportsPWA(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const onClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
        evt.preventDefault();
        if (!promptInstall) {
            return;
        }
        promptInstall.prompt();
        promptInstall.userChoice.then((choiceResult: { outcome: string }) => {
            if (choiceResult.outcome === 'accepted') {
                setSupportsPWA(false); // Hide the banner once accepted
            }
        });
    };

    const handleDismiss = () => {
        setDismissed(true);
    };

    if (!supportsPWA || dismissed) {
        return null;
    }

    return (
        <div className="sticky top-0 z-[100] bg-primary text-primary-foreground py-2 px-4 shadow-md w-full">
            <div className="container mx-auto flex items-center justify-between text-sm md:text-base">
                <div className="flex items-center gap-2">
                    <span className="font-semibold hidden sm:inline">Get the full experience.</span>
                    <span>Install {APP_NAME} to your home screen.</span>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 gap-2 bg-white text-primary hover:bg-white/90 font-bold"
                        onClick={onClick}
                    >
                        <Download className="w-3.5 h-3.5" />
                        Install
                    </Button>
                    <button onClick={handleDismiss} className="p-1 hover:bg-primary-foreground/20 rounded-full transition-colors" aria-label="Dismiss">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
