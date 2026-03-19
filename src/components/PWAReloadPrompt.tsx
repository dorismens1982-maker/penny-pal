import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export function PWAReloadPrompt() {
  const { toast } = useToast();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('PWA Service Worker registered');
    },
    onRegisterError(error) {
      console.error('PWA Service Worker registration error', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      toast({
        title: "Update Available!",
        description: "A new version of Penny Pal is ready. Update now to see the latest features.",
        duration: Infinity, // Keep it open until they act
        action: (
          <Button 
            variant="default" 
            size="sm" 
            className="bg-primary text-primary-foreground font-bold flex items-center gap-2"
            onClick={() => updateServiceWorker(true)}
          >
            <RefreshCw className="w-4 h-4" />
            Update Now
          </Button>
        ),
      });
    }
  }, [needRefresh, toast, updateServiceWorker]);

  return null; // This component doesn't render anything itself, it just triggers the toast
}
