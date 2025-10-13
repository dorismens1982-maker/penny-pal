import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Receipt, Settings, Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  onAddTransaction?: () => void;
}

export const Layout = ({ children, onAddTransaction }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/transactions', icon: Receipt, label: 'Transactions' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content (with top padding to offset nav height) */}
      <main className="pt-20 pb-20 flex-1">{children}</main>

      {/* Floating Add Button */}
      {onAddTransaction && (
        <Button
          onClick={onAddTransaction}
          className="fixed bottom-8 right-4 w-14 h-14 rounded-full bg-gradient-primary shadow-primary hover:shadow-lg transition-all duration-200 hover:scale-105 z-40"
          size="icon"
        >
          <Plus className="w-6 h-6 text-primary-foreground" />
        </Button>
      )}
    </div>
  );
};
