import React, { useState, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from './ImageUploader';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import type { BlogPost, CreateBlogPostData } from '@/types/blog';
import { X, Save, Eye } from 'lucide-react';

// ── Register custom fonts with Quill BEFORE any component renders ─────────────
const Font = Quill.import('formats/font') as any;
Font.whitelist = [
    'sans-serif',
    'serif',
    'monospace',
    'inter',
    'roboto',
    'poppins',
    'lato',
    'montserrat',
    'playfair-display',
    'merriweather',
    'source-code-pro',
];
Quill.register(Font, true);

// ── Toolbar + modules defined OUTSIDE the component to prevent reinitialisation ─
// This is the critical fix: if modules is defined inside the component body,
// every render creates a new object reference, causing Quill to tear down and
// remount — which wipes the editor content.
const modules = {
    toolbar: {
        container: [
            // Heading: only Normal / H1 / H2 / H3
            [{ header: [false, 1, 2, 3] }],

            // Font family
            [{
                font: [
                    false,           // default / inherit
                    'inter',
                    'roboto',
                    'poppins',
                    'lato',
                    'montserrat',
                    'playfair-display',
                    'merriweather',
                    'source-code-pro',
                    'serif',
                    'monospace',
                ],
            }],

            // Size
            [{ size: ['small', false, 'large', 'huge'] }],

            // Inline formatting
            ['bold', 'italic', 'underline', 'strike'],

            // Colour palettes – explicit curated list (text + highlight)
            [{
                color: [
                    // Blacks / Greys
                    '#000000', '#1a1a1a', '#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#dddddd', '#ffffff',
                    // Blues
                    '#0d47a1', '#1565c0', '#1976d2', '#1e88e5', '#42a5f5', '#90caf9',
                    // Greens
                    '#1b5e20', '#2e7d32', '#388e3c', '#43a047', '#66bb6a', '#a5d6a7',
                    // Reds / Pinks
                    '#b71c1c', '#c62828', '#d32f2f', '#ef5350', '#ef9a9a',
                    // Yellows / Ambers
                    '#f57f17', '#f9a825', '#fbc02d', '#fdd835', '#fff176',
                    // Purples
                    '#4a148c', '#6a1b9a', '#7b1fa2', '#ab47bc', '#ce93d8',
                    // Teals / Cyans
                    '#006064', '#00838f', '#00acc1', '#26c6da', '#80deea',
                    // Oranges
                    '#e65100', '#ef6c00', '#f57c00', '#fb8c00', '#ffcc02',
                    // Brand / custom
                    '#d4a017', '#c49010', '#f0c040',
                ],
            },
            {
                background: [
                    '#ffffff', '#f5f5f5', '#eeeeee', '#e0e0e0',
                    '#fff9c4', '#fff3e0', '#fce4ec', '#e8f5e9', '#e3f2fd', '#ede7f6',
                    '#ffeb3b', '#ff9800', '#f44336', '#4caf50', '#2196f3', '#9c27b0',
                    '#000000', '#1a1a1a', '#333333',
                    '#d4a017', '#c49010',
                ],
            }],

            // Script
            [{ script: 'sub' }, { script: 'super' }],

            // Lists & indent
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],

            // Align
            [{ align: [] }],

            // Media / blocks
            ['link', 'image', 'video'],
            ['blockquote', 'code-block'],

            // Clear formatting
            ['clean'],
        ],
    },
};

// Quill formats whitelist
const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image', 'video',
    'blockquote', 'code-block',
];

// ── Inject Google Fonts into head (runs once) ──────────────────────────────────
if (typeof document !== 'undefined') {
    const FONT_LINK_ID = 'quill-google-fonts';
    if (!document.getElementById(FONT_LINK_ID)) {
        const link = document.createElement('link');
        link.id = FONT_LINK_ID;
        link.rel = 'stylesheet';
        link.href =
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Roboto:wght@300;400;700&family=Poppins:wght@300;400;600;700&family=Lato:wght@300;400;700&family=Montserrat:wght@300;400;600;700&family=Playfair+Display:wght@400;700&family=Merriweather:wght@300;400;700&family=Source+Code+Pro:wght@400;600&display=swap';
        document.head.appendChild(link);
    }
}

// ── Component ──────────────────────────────────────────────────────────────────
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

    // Auto-generate slug from title (only for new posts)
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
            const result = await updatePost({ id: post.id, ...postData });
            success = !!result;
        } else {
            const result = await createPost(postData);
            success = !!result;
        }

        setSaving(false);

        if (success) {
            onSave?.();
            onClose();
        }
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
                                type="button"
                                onClick={() => setIsPreviewMode(false)}
                                className={`px-3 py-1 text-sm font-medium rounded ${!isPreviewMode ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Editor
                            </button>
                            <button
                                type="button"
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

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isPreviewMode ? (
                        <div className="max-w-3xl mx-auto space-y-8">
                            {imageUrl && (
                                <div className="w-full h-64 overflow-hidden rounded-xl">
                                    <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="space-y-4">
                                <h1 className="text-4xl md:text-5xl font-merriweather font-bold tracking-tight text-slate-900 leading-tight">
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
                                <p className="text-xs text-slate-500">URL: /insights/{slug}</p>
                            </div>

                            {/* Excerpt */}
                            <div className="space-y-2">
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea
                                    id="excerpt"
                                    value={excerpt}
                                    onChange={(e) => setExcerpt(e.target.value)}
                                    placeholder="A short summary for preview cards..."
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

                            {/* Featured Image */}
                            <ImageUploader
                                currentImage={imageUrl}
                                onImageSelect={handleImageSelect}
                                onRemoveImage={() => setImageUrl('')}
                                uploading={uploading}
                            />

                            {/* Rich-text Content Editor */}
                            <div className="space-y-2">
                                <Label>Content *</Label>
                                <div className="border border-slate-200 rounded-lg overflow-hidden blog-editor-wrap">
                                    <ReactQuill
                                        theme="snow"
                                        value={content}
                                        onChange={setContent}
                                        modules={modules}
                                        formats={formats}
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
                            {saving ? 'Saving…' : 'Save as Draft'}
                        </Button>
                        <Button
                            onClick={() => handleSave(true)}
                            disabled={saving}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {saving ? 'Publishing…' : published ? 'Update & Publish' : 'Publish'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Inline styles for custom font families rendered inside Quill */}
            <style>{`
                .ql-font-inter { font-family: 'Inter', sans-serif; }
                .ql-font-roboto { font-family: 'Roboto', sans-serif; }
                .ql-font-merriweather { font-family: 'Merriweather', serif; }
                .ql-font-lato { font-family: 'Lato', sans-serif; }
                .ql-font-montserrat { font-family: 'Montserrat', sans-serif; }
                .ql-font-playfair-display { font-family: 'Playfair Display', serif; }
                .ql-font-merriweather { font-family: 'Merriweather', serif; }
                .ql-font-source-code-pro { font-family: 'Source Code Pro', monospace; }
                .ql-font-serif { font-family: Georgia, 'Times New Roman', serif; }
                .ql-font-monospace { font-family: 'Courier New', Courier, monospace; }

                /* Font picker labels in the toolbar dropdown */
                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="inter"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="inter"]::before { content: 'Inter'; font-family: 'Inter', sans-serif; }

                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="roboto"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="roboto"]::before { content: 'Roboto'; font-family: 'Roboto', sans-serif; }

                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="poppins"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="poppins"]::before { content: 'Poppins'; font-family: 'Poppins', sans-serif; }

                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="lato"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="lato"]::before { content: 'Lato'; font-family: 'Lato', sans-serif; }

                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="montserrat"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="montserrat"]::before { content: 'Montserrat'; font-family: 'Montserrat', sans-serif; }

                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="playfair-display"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="playfair-display"]::before { content: 'Playfair Display'; font-family: 'Playfair Display', serif; }

                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="merriweather"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="merriweather"]::before { content: 'Merriweather'; font-family: 'Merriweather', serif; }

                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="source-code-pro"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="source-code-pro"]::before { content: 'Source Code Pro'; font-family: 'Source Code Pro', monospace; }

                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before { content: 'Serif'; font-family: Georgia, serif; }

                .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
                .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before { content: 'Monospace'; font-family: 'Courier New', monospace; }

                /* Make the Quill editor area taller */
                .blog-editor-wrap .ql-container { min-height: 280px; }
                .blog-editor-wrap .ql-editor { min-height: 280px; }
            `}</style>
        </div>
    );
};
