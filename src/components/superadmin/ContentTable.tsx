import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/types/blog';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useBlogPosts } from '@/hooks/useBlogPosts';

interface ContentTableProps {
    refreshTrigger: number;
    onEdit: (post: BlogPost) => void;
}

export const ContentTable = ({ refreshTrigger, onEdit }: ContentTableProps) => {
    const { posts, loading, deletePost, fetchAllPosts } = useBlogPosts();

    // Refetch when trigger changes
    React.useEffect(() => {
        fetchAllPosts();
    }, [refreshTrigger]);

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
            await deletePost(id);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-48 flex items-center justify-center text-muted-foreground">
                Loading content...
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[400px]">Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {posts.map((post) => (
                        <TableRow key={post.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {post.image_url && (
                                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                            <img src={post.image_url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{post.slug}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {post.published ? (
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">Published</Badge>
                                ) : (
                                    <Badge variant="secondary">Draft</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                                {new Date(post.created_at).toLocaleDateString()}
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
                                        <DropdownMenuItem onClick={() => onEdit(post)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Post
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => window.open(`/insights/${post.slug}`, '_blank')}>
                                            View Live
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(post.id, post.title)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
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
