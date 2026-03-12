import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from './ImageUploader';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import type { BlogPost, CreateBlogPostData } from '@/types/blog';
import { X, Save, Eye } from 'lucide-react';

interface BlogPostEditorProps {
    post?: BlogPost;
    onClose: () => void;
    onSave?: () => void;
}

export const BlogPostEditor: React.FC<BlogPostEditorProps> = ({
    post,
    onClose,
    onSave,
}) => {
    const { createPost, updatePost, uploadImage, generateSlug } = useBlogPosts();

    const [title, setTitle] = useState(post?.title || '');
    const [slug, setSlug] = useState(post?.slug || '');
    const [authorName, setAuthorName] = useState(post?.author_name || '');
    const [excerpt, setExcerpt] = useState(post?.excerpt || '');
    const [content, setContent] = useState(post?.content || '');
    const [imageUrl, setImageUrl] = useState(post?.image_url || '');
    const [category, setCategory] = useState(post?.category || '');
    const [published, setPublished] = useState(post?.published || false);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    // Auto-generate slug from title
    useEffect(() => {
        if (!post && title && !slug) {
            setSlug(generateSlug(title));
        }
    }, [title, post, slug, generateSlug]);

    const handleImageSelect = async (file: File) => {
        setUploading(true);
        const url = await uploadImage(file);
        if (url) {
            setImageUrl(url);
        }
        setUploading(false);
    };

    const handleSave = async (shouldPublish: boolean) => {
        if (!title || !content || !slug) {
            alert('Please fill in title, slug, and content');
            return;
        }

        setSaving(true);

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

        let success = false;
        if (post) {
            // Update existing post
            const result = await updatePost({ id: post.id, ...postData });
            success = !!result;
        } else {
            // Create new post
            const result = await createPost(postData);
            success = !!result;
        }

        setSaving(false);

        if (success) {
            onSave?.();
            onClose();
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-900">
                            {post ? 'Edit Post' : 'New Post'}
                        </h2>
                        <div className="flex bg-slate-100 p-1 rounded-md">
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
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isPreviewMode ? (
                        <div className="max-w-3xl mx-auto space-y-8">
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
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter post title"
                                    className="text-lg font-medium"
                                />
                            </div>

                            {/* Author */}
                            <div className="space-y-2">
                                <Label htmlFor="authorName">Author Name</Label>
                                <Input
                                    id="authorName"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    placeholder="Enter publisher name (leave empty for Anonymous)"
                                />
                            </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug *</Label>
                        <Input
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="post-url-slug"
                        />
                        <p className="text-xs text-slate-500">
                            URL: /insights/{slug}
                        </p>
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                            id="excerpt"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Brief description for preview cards"
                            rows={3}
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g., Budgeting Tips"
                        />
                    </div>

                    {/* Image */}
                    <ImageUploader
                        currentImage={imageUrl}
                        onImageSelect={handleImageSelect}
                        onRemoveImage={() => setImageUrl('')}
                        uploading={uploading}
                    />

                    {/* Content Editor */}
                    <div className="space-y-2">
                        <Label>Content *</Label>
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                className="min-h-[300px]"
                            />
                        </div>
                    </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="published"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                            className="rounded"
                        />
                        <Label htmlFor="published" className="cursor-pointer">
                            Publish immediately
                        </Label>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleSave(false)}
                            disabled={saving}
                            variant="outline"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button
                            onClick={() => handleSave(true)}
                            disabled={saving}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {published ? 'Update & Publish' : 'Publish'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
