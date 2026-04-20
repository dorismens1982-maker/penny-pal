import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from './ImageUploader';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import type { BlogSeries, BlogPost } from '@/types/blog';
import { X, Save, Eye, Plus, Trash2, GripVertical, BookOpen, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BlogSeriesEditorProps {
    series?: BlogSeries;
    onClose: () => void;
    onSave?: () => void;
    onCreateEpisode?: (seriesId: string, order: number) => void;
    initialTab?: 'details' | 'posts';
}

export const BlogSeriesEditor: React.FC<BlogSeriesEditorProps> = ({
    series,
    onClose,
    onSave,
    onCreateEpisode,
    initialTab = 'details',
}) => {
    const { createSeries, updateSeries, updatePost, uploadImage, generateSlug, posts: allPosts } = useBlogPosts();

    const [title, setTitle] = useState(series?.title || '');
    const [slug, setSlug] = useState(series?.slug || '');
    const [excerpt, setExcerpt] = useState(series?.excerpt || '');
    const [description, setDescription] = useState(series?.description || '');
    const [imageUrl, setImageUrl] = useState(series?.image_url || '');
    const [authorName, setAuthorName] = useState(series?.author_name || '');
    const [published, setPublished] = useState(series?.published || false);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Post management state - posts that currently belong to this series
    const [seriesPosts, setSeriesPosts] = useState<(BlogPost & { _order: number })[]>([]);
    const [selectedPostToAdd, setSelectedPostToAdd] = useState<string>('');
    const [savedSeriesId, setSavedSeriesId] = useState<string | undefined>(series?.id);
    const [activeTab, setActiveTab] = useState<'details' | 'posts'>(initialTab);

    // Build initial list of posts already in this series (when editing)
    useEffect(() => {
        if (savedSeriesId && allPosts.length > 0) {
            const existing = allPosts
                .filter(p => p.series_id === savedSeriesId)
                .map(p => ({ ...p, _order: p.series_order ?? 0 }))
                .sort((a, b) => a._order - b._order);
            setSeriesPosts(existing);
        }
    }, [savedSeriesId, allPosts]);

    // Auto-generate slug from title (only for new series)
    useEffect(() => {
        if (!series && title && !slug) {
            setSlug(generateSlug(title));
        }
    }, [title, series, slug, generateSlug]);

    const handleImageSelect = async (file: File) => {
        setUploading(true);
        const url = await uploadImage(file);
        if (url) {
            setImageUrl(url);
        }
        setUploading(false);
    };

    const handleSaveDetails = async (shouldPublish: boolean) => {
        if (!title || !slug) {
            alert('Please fill in title and slug');
            return;
        }

        setSaving(true);

        const seriesData = {
            title,
            slug,
            excerpt,
            description,
            image_url: imageUrl,
            author_name: authorName,
            published: shouldPublish,
            published_at: shouldPublish ? new Date().toISOString() : undefined,
        };

        let resultId: string | undefined = savedSeriesId;
        try {
            if (series) {
                const result = await updateSeries({ id: series.id, ...seriesData });
                if (result) resultId = series.id;
            } else {
                const result = await createSeries(seriesData) as any;
                if (result?.id) {
                    resultId = result.id;
                    setSavedSeriesId(result.id);
                }
            }
        } catch (err) {
            console.error('Error saving series:', err);
        }

        setSaving(false);

        if (resultId) {
            // If new series, switch to posts tab so user can add episodes
            if (!series) {
                setActiveTab('posts');
            } else {
                onSave?.();
                // We keep the modal open so they can manage posts after saving details
                // If they want to close, they use the Finish or X button.
                // However, we can show a success toast here if needed.
            }
        }
    };

    // Add a post to this series
    const handleAddPost = async () => {
        if (!selectedPostToAdd || !savedSeriesId) return;
        const postToAdd = allPosts.find(p => p.id === selectedPostToAdd);
        if (!postToAdd) return;

        const newOrder = seriesPosts.length > 0
            ? Math.max(...seriesPosts.map(p => p._order)) + 1
            : 1;

        try {
            await updatePost({
                id: postToAdd.id,
                series_id: savedSeriesId,
                series_order: newOrder,
            });
            setSeriesPosts(prev => [...prev, { ...postToAdd, _order: newOrder }]);
            setSelectedPostToAdd('');
        } catch (err) {
            console.error('Error adding post to series:', err);
        }
    };

    // Remove a post from this series
    const handleRemovePost = async (postId: string) => {
        try {
            await updatePost({
                id: postId,
                series_id: undefined,
                series_order: undefined,
            });
            setSeriesPosts(prev => prev.filter(p => p.id !== postId));
        } catch (err) {
            console.error('Error removing post from series:', err);
        }
    };

    // Reorder a post (swap with neighbor)
    const handleReorder = async (index: number, direction: 'up' | 'down') => {
        const newList = [...seriesPosts];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newList.length) return;

        // Swap positions
        [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];

        // Reassign order values
        const updatedList = newList.map((p, i) => ({ ...p, _order: i + 1 }));
        setSeriesPosts(updatedList);

        // Persist new order to DB
        try {
            await Promise.all([
                updatePost({ id: updatedList[index].id, series_order: updatedList[index]._order }),
                updatePost({ id: updatedList[swapIndex].id, series_order: updatedList[swapIndex]._order }),
            ]);
        } catch (err) {
            console.error('Error reordering posts:', err);
        }
    };

    const handleFinish = () => {
        onSave?.();
        onClose();
    };

    // Posts NOT yet in this series
    const availablePosts = allPosts.filter(
        p => !p.series_id || p.series_id !== savedSeriesId
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">
                        {series ? 'Edit Series Release' : 'New Series Release'}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Tabs (only shown when editing or after creating) */}
                {savedSeriesId && (
                    <div className="flex border-b border-slate-200 px-6">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            Series Details
                        </button>
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-2 ${activeTab === 'posts' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            Episodes / Posts
                            {seriesPosts.length > 0 && (
                                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                    {seriesPosts.length}
                                </Badge>
                            )}
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* ─── DETAILS TAB ─── */}
                    {activeTab === 'details' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="s-title">Series Title *</Label>
                                <Input
                                    id="s-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Penny Pal Q1 Review"
                                    className="text-lg font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="s-slug">Slug *</Label>
                                <Input
                                    id="s-slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="series-slug"
                                />
                                <p className="text-xs text-slate-500">URL: /insights/series/{slug}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="s-excerpt">Short Summary</Label>
                                <Input
                                    id="s-excerpt"
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    placeholder="A one-liner shown on the card preview in the feed"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="s-desc">Full Description</Label>
                                <Textarea
                                    id="s-desc"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Detailed description of what this series covers..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="s-author">Author Name</Label>
                                <Input
                                    id="s-author"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    placeholder="e.g. Penny Pal Team"
                                />
                            </div>

                            <ImageUploader
                                currentImage={imageUrl}
                                onImageSelect={handleImageSelect}
                                onRemoveImage={() => setImageUrl('')}
                                uploading={uploading}
                            />

                            {!savedSeriesId && (
                                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                    💡 Save the series first, then you can add posts/episodes to it.
                                </p>
                            )}
                        </>
                    )}

                    {/* ─── POSTS / EPISODES TAB ─── */}
                    {activeTab === 'posts' && savedSeriesId && (
                        <>
                            {/* Add a post to this series */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="font-semibold text-slate-800">Add Episode to this Series</Label>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 text-[10px] gap-1 bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                                        onClick={() => onCreateEpisode?.(savedSeriesId, seriesPosts.length + 1)}
                                    >
                                        <Plus className="w-3 h-3" />
                                        Create New Episode
                                    </Button>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Pick an existing article or create a new one to link it to this series.
                                </p>
                                <div className="flex gap-2">
                                    <Select value={selectedPostToAdd} onValueChange={setSelectedPostToAdd}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select a post to add…" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availablePosts.length === 0 ? (
                                                <SelectItem value="none" disabled>No posts available</SelectItem>
                                            ) : (
                                                availablePosts.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>
                                                        {p.title}
                                                        {!p.published && ' (Draft)'}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        onClick={handleAddPost}
                                        disabled={!selectedPostToAdd}
                                        className="shrink-0"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add
                                    </Button>
                                </div>
                            </div>

                            {/* Current episodes list */}
                            {seriesPosts.length === 0 ? (
                                <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-400 text-sm">No episodes added yet.</p>
                                    <p className="text-slate-400 text-xs">Use the selector above to add posts to this series.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label className="font-semibold text-slate-800">Current Episodes ({seriesPosts.length})</Label>
                                    <div className="space-y-2">
                                        {seriesPosts.map((post, index) => (
                                            <div
                                                key={post.id}
                                                className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm"
                                            >
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                                                    {post._order}
                                                </div>
                                                {post.image_url && (
                                                    <img src={post.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-slate-800 line-clamp-1">{post.title}</p>
                                                    {!post.published && (
                                                        <Badge variant="secondary" className="text-[9px] h-3.5 px-1">Draft</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-7 h-7"
                                                        onClick={() => handleReorder(index, 'up')}
                                                        disabled={index === 0}
                                                        title="Move up"
                                                    >
                                                        <ArrowUp className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-7 h-7"
                                                        onClick={() => handleReorder(index, 'down')}
                                                        disabled={index === seriesPosts.length - 1}
                                                        title="Move down"
                                                    >
                                                        <ArrowDown className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="w-7 h-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleRemovePost(post.id)}
                                                        title="Remove from series"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
                    {activeTab === 'details' ? (
                        <>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    tabIndex={-1}
                                    id="s-published"
                                    checked={published}
                                    onChange={(e) => setPublished(e.target.checked)}
                                    className="rounded"
                                />
                                <Label htmlFor="s-published" className="cursor-pointer">
                                    Make Series live (visible to public)
                                </Label>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => handleSaveDetails(false)}
                                    disabled={saving}
                                    variant="outline"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving…' : savedSeriesId ? 'Update Draft' : 'Save as Draft'}
                                </Button>
                                <Button
                                    onClick={() => handleSaveDetails(true)}
                                    disabled={saving}
                                >
                                    <Eye className="w-4 h-4 mr-2" />
                                    {saving ? 'Publishing…' : published ? 'Update & Live' : 'Publish Live'}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex justify-end w-full gap-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleFinish}>
                                Done — Save Series
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
