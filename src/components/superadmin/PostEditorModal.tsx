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
    const [authorName, setAuthorName] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('');
    const [published, setPublished] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    // Initialize form when opening
    useEffect(() => {
        if (open) {
            if (post) {
                setTitle(post.title);
                setSlug(post.slug);
                setAuthorName(post.author_name || '');
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
                setAuthorName('');
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
            author_name: authorName,
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
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ font: [] }],
            [{ size: ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ align: [] }],
            ['link', 'image', 'video'],
            ['blockquote', 'code-block'],
            ['clean'],
        ],
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2 border-b">
                    <div className="flex items-center justify-between w-full">
                        <DialogTitle>{post ? 'Edit Post' : 'Create New Post'}</DialogTitle>
                        <div className="flex bg-slate-100 p-1 rounded-md mr-8">
                            <button
                                onClick={() => setIsPreviewMode(false)}
                                className={`px-3 py-1 text-sm font-medium rounded ${!isPreviewMode ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Editor
                            </button>
                            <button
                                onClick={() => setIsPreviewMode(true)}
                                className={`px-3 py-1 text-sm font-medium rounded ${isPreviewMode ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Preview
                            </button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {isPreviewMode ? (
                        <div className="max-w-3xl mx-auto space-y-8 py-4">
                            {imageUrl && (
                                <div className="w-full h-64 overflow-hidden rounded-xl">
                                    <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl font-poppins font-bold tracking-tight text-slate-900 leading-tight">
                                    {title || 'Untitled Post'}
                                </h1>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span>By {authorName || 'Anonymous'}</span>
                                    <span>•</span>
                                    <span>{new Date().toLocaleDateString()}</span>
                                    {category && (
                                        <>
                                            <span>•</span>
                                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                                                {category}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div 
                                className="prose prose-lg max-w-none ql-editor"
                                dangerouslySetInnerHTML={{ __html: content }}
                            />
                        </div>
                    ) : (
                        <div className="space-y-6">
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
                                        <Label htmlFor="authorName">Author Name</Label>
                                        <Input
                                            id="authorName"
                                            value={authorName}
                                            onChange={(e) => setAuthorName(e.target.value)}
                                            placeholder="Enter publisher name (leave empty for Anonymous)"
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
                    )}
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
