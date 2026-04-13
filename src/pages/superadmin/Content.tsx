import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ContentTable } from '@/components/superadmin/ContentTable';
import { SeriesTable } from '@/components/superadmin/SeriesTable';
import { PostEditorModal } from '@/components/superadmin/PostEditorModal';
import { BlogSeriesEditor } from '@/components/blog/BlogSeriesEditor';
import { BlogPost, BlogSeries } from '@/types/blog';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { FileText, Layers, FolderPlus } from 'lucide-react';

const ContentPage = () => {
    const { fetchAnalytics } = useBlogPosts();
    const [activeTab, setActiveTab] = useState<'articles' | 'series'>('articles');
    
    // Post Modal State
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [initialSeriesId, setInitialSeriesId] = useState<string | undefined>();
    const [initialSeriesOrder, setInitialSeriesOrder] = useState<number | undefined>();

    // Series Editor State
    const [isSeriesEditorOpen, setIsSeriesEditorOpen] = useState(false);
    const [editingSeries, setEditingSeries] = useState<BlogSeries | undefined>();
    const [seriesEditorTab, setSeriesEditorTab] = useState<'details' | 'posts'>('details');

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0, totalComments: 0 });

    React.useEffect(() => {
        const loadStats = async () => {
            const data = await fetchAnalytics();
            setStats(data);
        };
        loadStats();
    }, [refreshTrigger]);

    const handleCreatePost = (initialSeriesId?: string, initialSeriesOrder?: number) => {
        setEditingPost(null);
        setInitialSeriesId(initialSeriesId);
        setInitialSeriesOrder(initialSeriesOrder);
        setIsPostModalOpen(true);
    };

    const handleEditPost = (post: BlogPost) => {
        setEditingPost(post);
        setInitialSeriesId(undefined);
        setInitialSeriesOrder(undefined);
        setIsPostModalOpen(true);
    };

    const handleCreateSeries = () => {
        setEditingSeries(undefined);
        setSeriesEditorTab('details');
        setIsSeriesEditorOpen(true);
    };

    const handleEditSeries = (series: BlogSeries, tab: 'details' | 'posts' = 'details') => {
        setEditingSeries(series);
        setSeriesEditorTab(tab);
        setIsSeriesEditorOpen(true);
    };

    const handleSaved = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Content Management</h1>
                    <p className="text-slate-500 mt-2">Manage blog posts, educational content, and series releases.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleCreateSeries} variant="outline" className="gap-2 bg-white">
                        <FolderPlus className="w-4 h-4" />
                        New Series
                    </Button>
                    <Button onClick={() => handleCreatePost()} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create New Post
                    </Button>
                </div>
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

            {/* Tab Navigation */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('articles')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                            ${activeTab === 'articles'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <FileText className="w-4 h-4" />
                        Standalone Articles
                    </button>
                    <button
                        onClick={() => setActiveTab('series')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
                            ${activeTab === 'series'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <Layers className="w-4 h-4" />
                        Series Releases
                    </button>
                </nav>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{activeTab === 'articles' ? 'Blog Posts' : 'Series Collections'}</CardTitle>
                </CardHeader>
                <CardContent>
                    {activeTab === 'articles' ? (
                        <ContentTable refreshTrigger={refreshTrigger} onEdit={handleEditPost} />
                    ) : (
                        <SeriesTable 
                            refreshTrigger={refreshTrigger} 
                            onEdit={(s) => handleEditSeries(s, 'details')} 
                            onManageEpisodes={(s) => handleEditSeries(s, 'posts')}
                        />
                    )}
                </CardContent>
            </Card>

            <PostEditorModal
                open={isPostModalOpen}
                onOpenChange={setIsPostModalOpen}
                post={editingPost}
                onSaved={handleSaved}
                initialSeriesId={initialSeriesId}
                initialSeriesOrder={initialSeriesOrder}
            />

            {isSeriesEditorOpen && (
                <BlogSeriesEditor
                    series={editingSeries}
                    onClose={() => setIsSeriesEditorOpen(false)}
                    onSave={handleSaved}
                    onCreateEpisode={(sId, ord) => handleCreatePost(sId, ord)}
                    initialTab={seriesEditorTab}
                />
            )}
        </div>
    );
};


export default ContentPage;
