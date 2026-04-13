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
import { BlogSeries } from '@/types/blog';
import { MoreHorizontal, Trash2, Edit, EyeOff, Eye, BookOpen } from 'lucide-react';
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

interface SeriesTableProps {
    refreshTrigger: number;
    onEdit: (series: BlogSeries) => void;
    onManageEpisodes: (series: BlogSeries) => void;
}

export const SeriesTable = ({ refreshTrigger, onEdit, onManageEpisodes }: SeriesTableProps) => {
    const { series, posts, loading, deleteSeries, toggleSeriesPublish, fetchAllPosts } = useBlogPosts();

    // Refetch when trigger changes
    React.useEffect(() => {
        fetchAllPosts(); // This invalidates both posts and series based on our recent useBlogPosts update
    }, [refreshTrigger]);

    const handleDelete = async (id: string, title: string) => {
        if (confirm(`Are you sure you want to delete the series "${title}"? Individual posts will remain but will be disassociated.`)) {
            await deleteSeries(id);
        }
    };

    const handleTogglePublish = async (id: string, currentlyPublished: boolean, title: string) => {
        const action = currentlyPublished ? 'unpublish' : 'publish';
        if (confirm(`Are you sure you want to ${action} the series "${title}"?`)) {
            await toggleSeriesPublish({ id, published: !currentlyPublished });
        }
    };

    if (loading) {
        return (
            <div className="w-full h-48 flex items-center justify-center text-muted-foreground">
                Loading series...
            </div>
        );
    }

    if (series.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">No series found.</p>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[400px]">Series Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Posts Count</TableHead>
                        <TableHead>Date Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {series.map((s) => (
                        <TableRow key={s.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    {s.image_url && (
                                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                            <img src={s.image_url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-sm line-clamp-1">{s.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">/series/{s.slug}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                {s.published ? (
                                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">Live</Badge>
                                ) : (
                                    <Badge variant="secondary">Hidden</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                                <Button 
                                    variant="link" 
                                    className="p-0 h-auto font-medium" 
                                    onClick={() => onManageEpisodes(s)}
                                >
                                    {posts.filter(p => p.series_id === s.id).length} Episodes
                                </Button>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground text-nowrap">
                                {new Date(s.created_at).toLocaleDateString()}
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
                                        <DropdownMenuItem onClick={() => onEdit(s)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onManageEpisodes(s)}>
                                            <BookOpen className="mr-2 h-4 w-4" />
                                            Manage Episodes
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => window.open(`/insights/series/${s.slug}`, '_blank')}>
                                            View Live
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleTogglePublish(s.id, s.published, s.title)}
                                            className={s.published
                                                ? 'text-amber-600 focus:text-amber-600'
                                                : 'text-green-600 focus:text-green-600'
                                            }
                                        >
                                            {s.published
                                                ? <><EyeOff className="mr-2 h-4 w-4" /> Hide Series</>  
                                                : <><Eye className="mr-2 h-4 w-4" /> Make Live</>
                                            }
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(s.id, s.title)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Series
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
