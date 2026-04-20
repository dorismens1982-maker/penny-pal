import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Mail, Users } from 'lucide-react';
import { useSubscribers } from '@/hooks/useSubscribers';
import { SubscribersTable } from '@/components/superadmin/SubscribersTable';
import { exportToExcel } from '@/utils/excelExport';

const SubscribersPage = () => {
    const { subscribers, loading, error } = useSubscribers();
    // TODO: Client-side filtering/searching can be added here

    const activeSubscribers = subscribers.filter(s => s.status === 'subscribed').length;

    const handleExport = () => {
        if (subscribers.length === 0) return;
        
        // Map data to a cleaner format for Excel
        const exportData = subscribers.map(s => ({
            'ID': s.id,
            'Email': s.email,
            'Status': s.status,
            'Subscribed At': new Date(s.subscribed_at).toLocaleString()
        }));

        exportToExcel(exportData, `subscribers_${new Date().toISOString().split('T')[0]}`, 'Subscribers');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Newsletter Subscribers</h1>
                    <p className="text-slate-500 mt-2">Manage your email list and automatic signups.</p>
                </div>
                <Button 
                    variant="outline" 
                    className="gap-2 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                    onClick={handleExport}
                    disabled={subscribers.length === 0}
                >
                    <Download className="w-4 h-4" />
                    Export Excel
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Total Subscribers
                            <Users className="w-4 h-4 text-slate-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{subscribers.length}</div>
                        <p className="text-xs text-slate-500 mt-1">All time signups</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Active Subscribers
                            <Mail className="w-4 h-4 text-green-500" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{activeSubscribers}</div>
                        <p className="text-xs text-slate-500 mt-1">Currently subscribed</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Subscribers List</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search emails..." className="pl-8" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
                            <p className="flex items-center gap-2">
                                <span className="font-semibold">Error loading subscribers:</span> {error}
                            </p>
                        </div>
                    ) : (
                        <SubscribersTable subscribers={subscribers} loading={loading} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SubscribersPage;
