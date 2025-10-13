import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Receipt,
  Settings,
  Plus,
  BarChart3,
  Menu as MenuIcon,
  X as XIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  onAddTransaction?: () => void;
}

export const Layout = ({ children, onAddTransaction }: LayoutProps) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/transactions', icon: Receipt, label: 'Transactions' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const toggleMenu = () => setMenuOpen((s) => !s);

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
              <span className="sr-only">Kudimate</span>
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
              <span className="text-sm font-semibold">Kudimate</span>
              <span className="text-xs text-muted-foreground -mt-0.5">
                Plan. Track. Grow.
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="flex items-center gap-2">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
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

          {/* Desktop Controls */}
          <div className="flex items-center gap-2">
            {onAddTransaction && (
              <Button
                onClick={onAddTransaction}
                className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-primary shadow-primary hover:shadow-lg transition-all duration-150"
              >
                <Plus className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm">Add</span>
              </Button>
            )}

            <Button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center w-10 h-10 rounded-md"
              size="icon"
              aria-label="Open menu"
            >
              {menuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* ===================== MOBILE BOTTOM NAV ===================== */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-50">
        <div className="relative flex items-center justify-between px-4 py-2">
          {/* Left two items */}
          <div className="flex items-center gap-2 flex-1 justify-evenly">
            {navItems.slice(0, 2).map(({ path, icon: Icon, label }) => {
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

          {/* Center Add Button */}
          {onAddTransaction && (
            <div className="absolute inset-x-0 -top-5 flex justify-center">
              <Button
                onClick={onAddTransaction}
                className="w-14 h-14 rounded-full bg-gradient-primary shadow-lg border-4 border-card hover:scale-105 transition-transform duration-200"
                size="icon"
              >
                <Plus className="w-6 h-6 text-primary-foreground" />
              </Button>
            </div>
          )}

          {/* Right two items */}
          <div className="flex items-center gap-2 flex-1 justify-evenly">
            {navItems.slice(2).map(({ path, icon: Icon, label }) => {
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
        </div>
      </nav>

      {/* ===================== MAIN CONTENT ===================== */}
      <main className="pt-16 md:pt-20 pb-24 flex-1">{children}</main>
    </div>
  );
};
