import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { BlogPost, CreateBlogPostData } from '@/types/blog';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { ImageUploader } from '@/components/blog/ImageUploader';
import { Lock, Unlock, Eye, Save } from 'lucide-react';

interface PostEditorModalProps {
    post: BlogPost | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
}

export const PostEditorModal = ({ post, open, onOpenChange, onSaved }: PostEditorModalProps) => {
    const { createPost, updatePost, generateSlug, uploadImage } = useBlogPosts();
    const [loading, setLoading] = useState(false);
    const [slugLocked, setSlugLocked] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form States
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('');
    const [published, setPublished] = useState(false);

    // Initialize form when opening
    useEffect(() => {
        if (open) {
            if (post) {
                setTitle(post.title);
                setSlug(post.slug);
                setExcerpt(post.excerpt || '');
                setContent(post.content);
                setImageUrl(post.image_url || '');
                setCategory(post.category || '');
                setPublished(post.published);
                setSlugLocked(true);
            } else {
                // Reset for new post
                setTitle('');
                setSlug('');
                setExcerpt('');
                setContent('');
                setImageUrl('');
                setCategory('');
                setPublished(false);
                setSlugLocked(true);
            }
        }
    }, [post, open]);

    // Auto-generate slug
    useEffect(() => {
        if (!post && slugLocked && title) {
            setSlug(generateSlug(title));
        }
    }, [title, post, slugLocked, generateSlug]);

    const handleImageSelect = async (file: File) => {
        setUploading(true);
        try {
            const url = await uploadImage(file);
            if (url) {
                setImageUrl(url);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (shouldPublish: boolean) => {
        if (!title || !content || !slug) {
            alert('Please fill in title, slug, and content');
            return;
        }

        setLoading(true);

        const postData: CreateBlogPostData = {
            title,
            slug,
            excerpt,
            content,
            image_url: imageUrl,
            category,
            published: shouldPublish,
            published_at: shouldPublish ? new Date().toISOString() : undefined,
        };

        try {
            if (post) {
                await updatePost({
                    id: post.id,
                    ...postData,
                });
            } else {
                await createPost(postData);
            }
            onSaved();
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'align': [] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2 border-b">
                    <DialogTitle>{post ? 'Edit Post' : 'Create New Post'}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Main Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter your post title"
                                    className="text-lg font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (URL)</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="slug"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        readOnly={slugLocked}
                                        className={slugLocked ? "bg-muted text-muted-foreground" : ""}
                                        placeholder="post-url-slug"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setSlugLocked(!slugLocked)}
                                        title={slugLocked ? "Unlock slug editing" : "Lock slug"}
                                    >
                                        {slugLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="e.g. Budgeting, Tips, News"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <ImageUploader
                                currentImage={imageUrl}
                                onImageSelect={handleImageSelect}
                                onRemoveImage={() => setImageUrl('')}
                                uploading={uploading}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                            id="excerpt"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="A short summary for preview cards..."
                            rows={2}
                        />
                    </div>

                    {/* Rich Text Editor */}
                    <div className="space-y-2">
                        <Label>Content *</Label>
                        <div className="border border-input rounded-md overflow-hidden bg-background">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                className="min-h-[300px] [&_.ql-container]:min-h-[300px] [&_.ql-toolbar]:border-none [&_.ql-container]:border-none"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 border-t bg-slate-50">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="published"
                                checked={published}
                                onCheckedChange={setPublished}
                            />
                            <Label htmlFor="published">Publish immediately</Label>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleSubmit(false)}
                                disabled={loading}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save as Draft
                            </Button>
                            <Button
                                onClick={() => handleSubmit(true)}
                                disabled={loading}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                {published ? 'Update & Publish' : 'Publish'}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
