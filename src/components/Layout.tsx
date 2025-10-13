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
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm"
              aria-hidden
            >
              {/* simple emblem — keeps it textless for compactness */}
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
              <span className="text-xs text-muted-foreground -mt-0.5">Plan. Track. Grow.</span>
            </div>
          </div>

          {/* Desktop nav (hidden on small screens, still available visually) */}
          <nav className="hidden md:flex items-center gap-2">
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

          {/* Right controls: Add button (desktop), Hamburger */}
          <div className="flex items-center gap-2">
            {/* Show Add on md+ to match original FAB behavior but keep FAB too */}
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

      {/* Slide-over Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 pointer-events-none ${
          menuOpen ? 'pointer-events-auto' : ''
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={toggleMenu}
        />

        {/* Panel */}
        <aside
          className={`absolute left-0 top-0 h-full w-64 bg-card border-r border-border shadow-xl transform transition-transform duration-250 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <span className="text-white text-sm font-semibold">K</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Kudimate</span>
                <span className="text-xs text-muted-foreground">Your finances, simplified</span>
              </div>
            </div>
            <Button onClick={toggleMenu} size="icon" className="w-9 h-9">
              <XIcon className="w-4 h-4" />
            </Button>
          </div>

          <nav className="px-2 py-4 space-y-1">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground hover:bg-muted/50'
                  }`}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-3 pb-6">
            {onAddTransaction && (
              <Button
                onClick={() => {
                  onAddTransaction();
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2 rounded-md bg-gradient-primary shadow-primary"
              >
                <Plus className="w-4 h-4 mr-2 text-primary-foreground" /> Add Transaction
              </Button>
            )}
          </div>
        </aside>
      </div>

      {/* Main Content (with top padding to offset header height) */}
      <main className="pt-16 pb-20 flex-1">{children}</main>

      {/* Floating Add Button (unchanged behavior, stays above content) */}
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
