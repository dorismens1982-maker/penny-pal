import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ContentTable } from '@/components/superadmin/ContentTable';
import { PostEditorModal } from '@/components/superadmin/PostEditorModal';
import { BlogPost } from '@/types/blog';
import { useBlogPosts } from '@/hooks/useBlogPosts';

const ContentPage = () => {
    const { fetchAnalytics } = useBlogPosts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0, totalComments: 0 });

    React.useEffect(() => {
        const loadStats = async () => {
            const data = await fetchAnalytics();
            setStats(data);
        };
        loadStats();
    }, [refreshTrigger]);

    const handleCreate = () => {
        setEditingPost(null);
        setIsModalOpen(true);
    };

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setIsModalOpen(true);
    };

    const handleSaved = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Content Management</h1>
                    <p className="text-slate-500 mt-2">Manage blog posts and educational content.</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create New Post
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white/90 text-sm font-medium">Total Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalPosts}</div>
                        <p className="text-indigo-100 text-xs mt-1">Published articles</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white/90 text-sm font-medium">Total Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.totalLikes + stats.totalComments}</div>
                        <p className="text-rose-100 text-xs mt-1">Likes & Comments</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border text-slate-900">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-500 text-sm font-medium">Detailed Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-red-500" /> Likes
                            </span>
                            <span className="font-bold">{stats.totalLikes}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mt-2">
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500" /> Comments
                            </span>
                            <span className="font-bold">{stats.totalComments}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Blog Posts</CardTitle>
                </CardHeader>
                <CardContent>
                    <ContentTable refreshTrigger={refreshTrigger} onEdit={handleEdit} />
                </CardContent>
            </Card>

            <PostEditorModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                post={editingPost}
                onSaved={handleSaved}
            />
        </div>
    );
};

export default ContentPage;
