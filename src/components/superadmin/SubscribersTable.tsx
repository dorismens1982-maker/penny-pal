import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, XCircle, MoreHorizontal } from 'lucide-react';
import { Subscriber } from '@/hooks/useSubscribers';
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface SubscribersTableProps {
    subscribers: Subscriber[];
    loading: boolean;
}

export const SubscribersTable = ({ subscribers, loading }: SubscribersTableProps) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (subscribers.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                <Mail className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-sm font-semibold text-slate-900">No subscribers</h3>
                <p className="mt-1 text-sm text-slate-500">Wait for new users to sign up or join the newsletter.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Subscribed At</TableHead>
                        <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {subscribers.map((sub) => (
                        <TableRow key={sub.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {sub.email.charAt(0).toUpperCase()}
                                </div>
                                <span>{sub.email}</span>
                            </TableCell>
                            <TableCell>
                                {sub.status === 'subscribed' ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 pr-2.5">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Subscribed
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 gap-1 pr-2.5">
                                        <XCircle className="w-3 h-3" />
                                        Unsubscribed
                                    </Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-slate-500 text-sm">
                                {format(new Date(sub.subscribed_at), 'MMM d, yyyy • h:mm a')}
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
                                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(sub.email)}>
                                            Copy Email
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        {/* TODO: Implement status flip if needed */}
                                        <DropdownMenuItem disabled>
                                            Change Status
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
