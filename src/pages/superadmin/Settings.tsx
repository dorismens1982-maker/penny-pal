import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, ShieldAlert, Bell, Lock, Server, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SettingsPage = () => {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [emailAlerts, setEmailAlerts] = useState(true);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground mt-2">Manage system-wide configurations and admin preferences.</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Back to App
                </Button>
            </div>

            {/* Admin Profile */}
            <Card>
                <CardHeader>
                    <CardTitle>Admin Profile</CardTitle>
                    <CardDescription>Your administrative access details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Email Address</Label>
                            <div className="p-3 bg-muted rounded-md text-foreground border border-border font-mono text-sm">
                                {user?.email}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Role Scope</Label>
                            <div className="flex items-center h-10">
                                <Badge variant="secondary" className="bg-primary/10 text-primary pointer-events-none">
                                    Super Admin
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Appearance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Moon className="w-5 h-5" />
                            Appearance
                        </CardTitle>
                        <CardDescription>Customize your dashboard view</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Dark Mode</Label>
                                <p className="text-sm text-muted-foreground">
                                    Switch between light and dark themes
                                </p>
                            </div>
                            <Switch
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Notifications
                        </CardTitle>
                        <CardDescription>Manage system alerts</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Email Alerts</Label>
                                <p className="text-sm text-muted-foreground">
                                    Receive critical system alerts via email
                                </p>
                            </div>
                            <Switch
                                checked={emailAlerts}
                                onCheckedChange={setEmailAlerts}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* System Controls */}
            <Card className="border-destructive/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <ShieldAlert className="w-5 h-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>Critical system controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-destructive" />
                                <Label className="text-base font-semibold text-destructive">Maintenance Mode</Label>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-[300px]">
                                Taking the system offline will prevent users from accessing the dashboard.
                            </p>
                        </div>
                        <Switch
                            checked={maintenanceMode}
                            onCheckedChange={setMaintenanceMode}
                            className="data-[state=checked]:bg-destructive"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;
