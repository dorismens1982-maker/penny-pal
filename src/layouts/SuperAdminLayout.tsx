import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail } from '@/utils/admin';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Shield,
    ArrowLeft,
    Menu
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { APP_NAME } from '@/config/app';

interface SuperAdminLayoutProps {
    children: React.ReactNode;
}

export const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check admin access
    const hasAdminAccess = isAdminEmail(user?.email);

    if (!hasAdminAccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <Shield className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
                    <p className="text-slate-600">
                        You don't have permission to access the Super Admin Dashboard.
                        This area is restricted to authorized administrators only.
                    </p>
                    <Button onClick={() => navigate('/')} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    const navItems = [
        { path: '/superadmin', label: 'Overview', icon: LayoutDashboard },
        { path: '/superadmin/users', label: 'Users', icon: Users },
        { path: '/superadmin/content', label: 'Changes', icon: FileText },
        { path: '/superadmin/settings', label: 'Settings', icon: Settings },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white border-r border-slate-200">
            <div className="p-6 border-b border-slate-100">
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
                        <span className="text-sm font-semibold text-slate-900">Super Admin</span>
                        <span className="text-xs text-muted-foreground -mt-0.5">
                            {APP_NAME}
                        </span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link to={item.path} key={item.path}>
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}>
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-100">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">Admin</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => signOut()}
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 fixed h-full z-30">
                <SidebarContent />
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 flex items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                        <svg
                            width="16"
                            height="16"
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
                    <span className="font-bold text-slate-900">Super Admin</span>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-900">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 border-none">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

