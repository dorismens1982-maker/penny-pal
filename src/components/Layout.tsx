import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  onAddTransaction?: () => void;
}

export const Layout = ({ children, onAddTransaction }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: '/learn', icon: BookOpen, label: 'Learn' },
    { path: '/manage', icon: Wallet, label: 'Manage' },
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
                Learn. Act. Grow.
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

      {/* ===================== MAIN CONTENT ===================== */}
      <main className="pt-16 md:pt-20 pb-20 flex-1">{children}</main>

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
