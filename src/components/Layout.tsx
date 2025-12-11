import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail } from '@/utils/admin';
import {
  BookOpen,
  Plus,
  Wallet,
  Receipt,
  BarChart3,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_NAME } from '@/config/app';

interface LayoutProps {
  children: React.ReactNode;
  onAddTransaction?: () => void;
}

export const Layout = ({ children, onAddTransaction }: LayoutProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab');
  const isAdmin = isAdminEmail(user?.email);

  const desktopNavItems = [
    { path: '/insights', icon: BookOpen, label: 'Insights' },
    { path: '/manage', icon: Wallet, label: 'Manage' },
    ...(isAdmin ? [{ path: '/superadmin', icon: LayoutDashboard, label: 'Admin' }] : []),
  ];

  const mobileNavItems = [
    { path: '/manage?tab=overview', icon: Wallet, label: 'Overview', isActive: location.pathname === '/manage' && (currentTab === 'overview' || !currentTab) },
    { path: '/manage?tab=transactions', icon: Receipt, label: 'Transactions', isActive: location.pathname === '/manage' && currentTab === 'transactions' },
    { path: '/manage?tab=analytics', icon: BarChart3, label: 'Analytics', isActive: location.pathname === '/manage' && currentTab === 'analytics' },
    { path: '/insights', icon: BookOpen, label: 'Insights', isActive: location.pathname.startsWith('/insights') },
    { path: '/manage?tab=settings', icon: Settings, label: 'Settings', isActive: location.pathname === '/manage' && currentTab === 'settings' },
    ...(isAdmin ? [{ path: '/superadmin', icon: LayoutDashboard, label: 'Admin', isActive: location.pathname.startsWith('/superadmin') }] : []),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ===================== DESKTOP HEADER ===================== */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm"
              aria-hidden
            >
              <span className="sr-only">{APP_NAME}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path d="M4 12h16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 7h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 17h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">{APP_NAME}</span>
              <span className="text-xs text-muted-foreground -mt-0.5">
                Insights. Act. Grow.
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="flex items-center gap-2">
            {desktopNavItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname.startsWith(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Add Button */}
          {onAddTransaction && (
            <Button
              onClick={onAddTransaction}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-primary shadow-primary hover:shadow-lg transition-all duration-150"
            >
              <Plus className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-medium">Add Transaction</span>
            </Button>
          )}
        </div>
      </header>

      {/* ===================== MOBILE BOTTOM NAV ===================== */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-50">
        <div className={`grid ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'} items-center justify-between px-1 py-2`}>
          {mobileNavItems.map(({ path, icon: Icon, label, isActive }) => {
            return (
              <Link
                key={label}
                to={path}
                className={`flex flex-col items-center justify-center px-1 py-2 rounded-lg transition-colors ${isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ===================== MAIN CONTENT ===================== */}
      {/* CHANGED: remove mobile top padding; keep only md+ padding to sit under fixed header */}
      <main className="pt-0 md:pt-[60px] pb-20 flex-1">
        {children}
        <div className="mt-12 mb-4 text-center pb-safe">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/30 font-semibold hover:text-primary/50 transition-colors cursor-default">
            Made by samthecreatorr
          </p>
        </div>
      </main>

      {/* ===================== FLOATING ADD BUTTON ===================== */}
      {onAddTransaction && (
        <Button
          onClick={onAddTransaction}
          className="fixed bottom-20 md:bottom-8 right-4 w-14 h-14 rounded-full bg-gradient-primary shadow-primary hover:shadow-lg transition-all duration-200 hover:scale-105 z-40"
          size="icon"
        >
          <Plus className="w-6 h-6 text-primary-foreground" />
        </Button>
      )}
    </div>
  );
};
