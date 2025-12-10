import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500 mt-2">Manage your admin preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Admin Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                            <div className="p-3 bg-slate-100 rounded-md text-slate-900 border border-slate-200">
                                {user?.email}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Role</label>
                            <div className="flex items-center h-11">
                                <Badge className="bg-indigo-500 hover:bg-indigo-600">Super Admin</Badge>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>System Preferences</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center bg-slate-50 rounded-md">
                    <p className="text-slate-400">Settings Implementation Pending</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default SettingsPage;
