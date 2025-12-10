import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AuthUser } from '@/hooks/useUsers';
import { MoreHorizontal, Trash2, Shield, Mail, CheckCircle, XCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UsersTableProps {
    users: AuthUser[];
    loading: boolean;
    onDelete?: (id: string) => void;
}

export const UsersTable = ({ users, loading, onDelete }: UsersTableProps) => {
    if (loading) {
        return (
            <div className="w-full h-48 flex items-center justify-center text-muted-foreground">
                Loading users...
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No users found.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Sign In</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => {
                        const displayName = user.user_metadata?.preferred_name || user.email?.split('@')[0] || 'User';
                        const isVerified = !!user.email_confirmed_at;

                        return (
                            <TableRow key={user.id}>
                                <TableCell className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                        <span className="text-xs font-bold text-primary">
                                            {displayName.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{displayName}</p>
                                        <p className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}...</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {user.email || 'N/A'}
                                </TableCell>
                                <TableCell>
                                    {isVerified ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            <CheckCircle className="w-3 h-3" />
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                            <XCircle className="w-3 h-3" />
                                            Unverified
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {user.last_sign_in_at
                                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                                        : 'Never'}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                                Copy User ID
                                            </DropdownMenuItem>
                                            {user.email && (
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Copy Email
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onDelete?.(user.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

