import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Home, Receipt, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  onAddTransaction?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onAddTransaction }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Helper: check if route starts with the nav path (for nested routes)
  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: Home },
    { path: '/transactions', label: 'Transactions', icon: Receipt },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col pb-16">
      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Floating Add Button */}
      {onAddTransaction && (
        <Button
          onClick={onAddTransaction}
          size="icon"
          className="fixed bottom-20 right-6 w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-card border-t border-border backdrop-blur-md flex justify-around py-3 z-40">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = isActivePath(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center text-xs ${
                isActive ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-primary' : ''}`} />
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
