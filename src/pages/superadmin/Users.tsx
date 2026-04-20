import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download, Trash2, Shield } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { UsersTable } from '@/components/superadmin/UsersTable';
import { exportToExcel } from '@/utils/excelExport';

const UsersPage = () => {
    const { users, loading, error, refreshUsers } = useUsers();
    const [searchTerm, setSearchTerm] = React.useState('');

    const handleExport = () => {
        if (users.length === 0) return;

        // Map data to a cleaner format for Excel
        const exportData = users.map(user => ({
            'ID': user.id,
            'Email': user.email || 'N/A',
            'Name': user.user_metadata?.preferred_name || 'N/A',
            'Role': user.role || 'user',
            'Created At': user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A',
            'Last Sign In': user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'
        }));

        exportToExcel(exportData, `users_${new Date().toISOString().split('T')[0]}`, 'Users');
    };

    const filteredUsers = React.useMemo(() => {
        if (!searchTerm) return users;
        const lowTerm = searchTerm.toLowerCase();
        return users.filter(user => 
            (user.email?.toLowerCase().includes(lowTerm)) ||
            (user.user_metadata?.preferred_name?.toLowerCase().includes(lowTerm)) ||
            (user.id.toLowerCase().includes(lowTerm))
        );
    }, [users, searchTerm]);

    const handleDelete = async (id: string) => {
        // Implement delete logic here later
        console.log('Delete user', id);
        alert('Delete functionality to be implemented');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                    <p className="text-slate-500 mt-2">View and manage all registered users.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Users List</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search users..." 
                                className="pl-8" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="p-4 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                            <p className="flex items-center gap-2">
                                <span className="font-semibold">Note:</span> {error}
                            </p>
                        </div>
                    ) : (
                        <UsersTable 
                            users={filteredUsers} 
                            loading={loading} 
                            onDelete={handleDelete} 
                            onRefresh={refreshUsers} 
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default UsersPage;
