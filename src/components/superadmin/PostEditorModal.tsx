import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill';
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
import { Lock, Unlock, Eye, Save, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ── Register custom fonts once, at module level ────────────────────────────────
const Font = Quill.import('formats/font') as any;
Font.whitelist = [
    'sans-serif', 'serif', 'monospace',
    'inter', 'roboto', 'poppins', 'lato', 'montserrat',
    'playfair-display', 'merriweather', 'source-code-pro',
];
Quill.register(Font, true);

// ── Inject Google Fonts into <head> once ──────────────────────────────────────
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

// ── A stable modules object that lives OUTSIDE the component ──────────────────
// CRITICAL: defining this inside the component (or via useMemo) causes React to
// produce a new object on every render → Quill sees a config change → it tears
// down and remounts → ALL content is wiped. Keeping it here prevents that.
const modules = {
    toolbar: {
        container: [
            // Heading: Normal / H1 / H2 / H3 only
            [{ header: [false, 1, 2, 3] }],

            // Font family
            [{
                font: [
                    false, 'inter', 'roboto', 'poppins', 'lato', 'montserrat',
                    'playfair-display', 'merriweather', 'source-code-pro',
                    'serif', 'monospace',
                ],
            }],

            // Size
            [{ size: ['small', false, 'large', 'huge'] }],

            // Inline
            ['bold', 'italic', 'underline', 'strike'],

            // Curated colour palettes
            [{
                color: [
                    '#000000', '#1a1a1a', '#333333', '#555555', '#777777', '#999999', '#bbbbbb', '#ffffff',
                    '#0d47a1', '#1976d2', '#42a5f5', '#90caf9',
                    '#1b5e20', '#388e3c', '#66bb6a', '#a5d6a7',
                    '#b71c1c', '#d32f2f', '#ef5350', '#ef9a9a',
                    '#f57f17', '#fbc02d', '#fdd835', '#fff176',
                    '#4a148c', '#7b1fa2', '#ab47bc', '#ce93d8',
                    '#006064', '#00acc1', '#26c6da', '#80deea',
                    '#e65100', '#f57c00', '#fb8c00', '#ffcc02',
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

            // Media / blocks – note: 'image' here will be overridden by handler
            ['link', 'image', 'video'],
            ['blockquote', 'code-block'],

            ['clean'],
        ],
        // NOTE: the image handler is attached dynamically inside the component
        // via quillRef so we don't need to put uploadImage here (which would
        // make this object unstable).
    },
};

const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'script',
    'list', 'bullet', 'indent', 'align',
    'link', 'image', 'video',
    'blockquote', 'code-block',
];

// Inline font CSS for inside-Quill rendering
const fontStyles = `
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

    .ql-container { min-height: 300px; }
    .ql-editor { min-height: 300px; }
`;

// ── Component ─────────────────────────────────────────────────────────────────
interface PostEditorModalProps {
    post: BlogPost | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
    initialSeriesId?: string;
    initialSeriesOrder?: number;
}

export const PostEditorModal = ({ 
    post, 
    open, 
    onOpenChange, 
    onSaved,
    initialSeriesId,
    initialSeriesOrder
}: PostEditorModalProps) => {
    const { createPost, updatePost, generateSlug, uploadImage } = useBlogPosts();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [slugLocked, setSlugLocked] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [fixingImages, setFixingImages] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('');
    const [readTime, setReadTime] = useState('5');
    const [published, setPublished] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    
    // Series support
    const { series } = useBlogPosts(); // get available series
    const [seriesId, setSeriesId] = useState<string>('none');
    const [seriesOrder, setSeriesOrder] = useState<string>('');

    // Keep a stable ref to uploadImage so the toolbar handler can access the
    // latest version without being listed as a modules dependency.
    const uploadImageRef = useRef(uploadImage);
    useEffect(() => { uploadImageRef.current = uploadImage; }, [uploadImage]);

    const quillRef = useRef<ReactQuill>(null);

    // Attach image handlers ONCE after Quill mounts.
    // Also intercept paste/drop so images never get inserted as base64.
    useEffect(() => {
        if (!quillRef.current) return;
        const quill = quillRef.current.getEditor();
        const toolbar = quill.getModule('toolbar') as any;

        // ── Toolbar button handler ──────────────────────────────────────────────
        if (toolbar) {
            toolbar.addHandler('image', () => {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                input.click();
                input.onchange = async () => {
                    const file = input.files?.[0];
                    if (!file) return;
                    setLoading(true);
                    try {
                        const url = await uploadImageRef.current(file);
                        if (url) {
                            const range = quill.getSelection();
                            quill.insertEmbed(range?.index ?? 0, 'image', url);
                        }
                    } finally {
                        setLoading(false);
                    }
                };
            });
        }

        // ── Paste interceptor: upload image files pasted from clipboard ─────────
        const editorEl = quill.root;

        const handlePaste = async (e: ClipboardEvent) => {
            const items = Array.from(e.clipboardData?.items ?? []);
            const imageItem = items.find(item => item.type.startsWith('image/'));
            if (!imageItem) return;
            e.preventDefault();
            const file = imageItem.getAsFile();
            if (!file) return;
            setLoading(true);
            try {
                const url = await uploadImageRef.current(file);
                if (url) {
                    const range = quill.getSelection() ?? { index: quill.getLength(), length: 0 };
                    quill.insertEmbed(range.index, 'image', url);
                    quill.setSelection(range.index + 1, 0);
                }
            } finally {
                setLoading(false);
            }
        };

        // ── Drop interceptor: upload image files dragged into the editor ────────
        const handleDrop = async (e: DragEvent) => {
            const items = Array.from(e.dataTransfer?.items ?? []);
            const imageItem = items.find(item => item.kind === 'file' && item.type.startsWith('image/'));
            if (!imageItem) return;
            e.preventDefault();
            e.stopPropagation();
            const file = imageItem.getAsFile();
            if (!file) return;
            setLoading(true);
            try {
                const url = await uploadImageRef.current(file);
                if (url) {
                    const range = quill.getSelection() ?? { index: quill.getLength(), length: 0 };
                    quill.insertEmbed(range.index, 'image', url);
                    quill.setSelection(range.index + 1, 0);
                }
            } finally {
                setLoading(false);
            }
        };

        editorEl.addEventListener('paste', handlePaste as EventListener);
        editorEl.addEventListener('drop', handleDrop as EventListener);

        return () => {
            editorEl.removeEventListener('paste', handlePaste as EventListener);
            editorEl.removeEventListener('drop', handleDrop as EventListener);
        };
    // Only run once after editor mounts — ref keeps uploadImage fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Initialize / reset form when the modal opens
    useEffect(() => {
        if (open) {
            if (post) {
                setTitle(post.title);
                setSlug(post.slug);
                setAuthorName(post.author_name || '');
                setExcerpt(post.excerpt || '');
                setContent(post.content || '');
                setImageUrl(post.image_url || '');
                setCategory(post.category || '');
                setReadTime(post.read_time || '5');
                setPublished(post.published);
                setSeriesId(post.series_id || 'none');
                setSeriesOrder(post.series_order?.toString() || '');
                setSlugLocked(true);
            } else {
                setTitle('');
                setSlug('');
                setAuthorName('');
                setExcerpt('');
                setContent('');
                setImageUrl('');
                setCategory('');
                setReadTime('5');
                setPublished(false);
                setSeriesId(initialSeriesId || 'none');
                setSeriesOrder(initialSeriesOrder?.toString() || '');
                setSlugLocked(true);
            }
            setIsPreviewMode(false);
        }
    }, [post, open, initialSeriesId, initialSeriesOrder]);

    // Auto-generate slug on title change
    useEffect(() => {
        if (!post && slugLocked && title) {
            setSlug(generateSlug(title));
        }
    }, [title, post, slugLocked, generateSlug]);

    const handleImageSelect = async (file: File) => {
        setUploading(true);
        try {
            const url = await uploadImage(file);
            if (url) setImageUrl(url);
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
            read_time: readTime,
            published: shouldPublish,
            published_at: shouldPublish ? new Date().toISOString() : undefined,
            series_id: seriesId === 'none' ? undefined : seriesId,
            series_order: seriesOrder ? parseInt(seriesOrder, 10) : undefined,
        };
        try {
            if (post) {
                await updatePost({ id: post.id, ...postData });
            } else {
                await createPost(postData);
            }
            onSaved();
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    };

    const handleFixImages = async () => {
        if (!content || !content.includes('data:image/')) return;

        setFixingImages(true);
        toast({
            title: "Processing images...",
            description: "Uploading base64 images to Cloudinary. This may take a moment.",
        });

        // Use a temporary div to parse HTML and find images
        const div = document.createElement('div');
        div.innerHTML = content;
        const images = Array.from(div.querySelectorAll('img[src^="data:image/"]')) as HTMLImageElement[];

        let fixedCount = 0;
        for (const img of images) {
            const base64 = img.getAttribute('src');
            if (base64) {
                try {
                    // Convert base64 to File
                    const res = await fetch(base64);
                    const blob = await res.blob();
                    const extension = blob.type.split('/')[1] || 'png';
                    const file = new File([blob], `scrubbed-image-${Date.now()}-${fixedCount}.${extension}`, { type: blob.type });

                    const url = await uploadImageRef.current(file);
                    if (url) {
                        img.setAttribute('src', url);
                        fixedCount++;
                    }
                } catch (error) {
                    console.error('Error fixing image:', error);
                }
            }
        }

        if (fixedCount > 0) {
            setContent(div.innerHTML);
            toast({
                title: "Images fixed",
                description: `Successfully uploaded ${fixedCount} images to Cloudinary.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "No images fixed",
                description: "We couldn't process the base64 images. Please try uploading them manually.",
            });
        }
        setFixingImages(false);
    };

    const hasLargeImages = content?.includes('data:image/') ?? false;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col p-0 gap-0">
                <DialogHeader className="p-6 pb-2 border-b">
                    <div className="flex items-center justify-between w-full">
                        <DialogTitle>{post ? 'Edit Post' : 'Create New Post'}</DialogTitle>
                        <div className="flex bg-slate-100 p-1 rounded-md mr-8">
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
                                <h1 className="text-4xl md:text-5xl font-merriweather font-bold tracking-tight text-slate-900 leading-tight">
                                    {title || 'Untitled Post'}
                                </h1>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span>By {authorName || 'Anonymous'}</span>
                                    <span>•</span>
                                    <span>{readTime || '5'} min read</span>
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Category</Label>
                                            <Input
                                                id="category"
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                placeholder="e.g. Budgeting, Tips"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="readTime">Read Time (min)</Label>
                                            <Input
                                                id="readTime"
                                                value={readTime}
                                                onChange={(e) => setReadTime(e.target.value)}
                                                placeholder="e.g. 5"
                                            />
                                        </div>
                                    </div>

                                    {/* Series Assignment */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="series">Belongs to Series</Label>
                                            <Select value={seriesId} onValueChange={setSeriesId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a Series" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Not in a series</SelectItem>
                                                    {series.map(s => (
                                                        <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="seriesOrder">Series Order (No.)</Label>
                                            <Input
                                                id="seriesOrder"
                                                type="number"
                                                value={seriesOrder}
                                                onChange={(e) => setSeriesOrder(e.target.value)}
                                                placeholder="e.g. 1"
                                                disabled={seriesId === 'none'}
                                                className={seriesId === 'none' ? 'bg-slate-100 opacity-50' : ''}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label>Slug & Featured Image</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="slug"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            readOnly={slugLocked}
                                            className={slugLocked ? 'bg-muted text-muted-foreground' : ''}
                                            placeholder="post-url-slug"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setSlugLocked(!slugLocked)}
                                            title={slugLocked ? 'Unlock slug' : 'Lock slug'}
                                        >
                                            {slugLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                        </Button>
                                    </div>

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
                                <div className="flex items-center justify-between">
                                    <Label>Content *</Label>
                                    {hasLargeImages && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-100 animate-pulse">
                                                ⚠️ Base64 Images Detected (May cause slow saving)
                                            </span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleFixImages}
                                                disabled={fixingImages}
                                                className="h-6 text-[10px] px-2 border-amber-200 hover:bg-amber-50 text-amber-700 font-bold"
                                            >
                                                {fixingImages ? "Fixing..." : "FIX NOW"}
                                                <Wand2 className="w-3 h-3 ml-1" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                <div className="border border-input rounded-md overflow-hidden bg-background">
                                    <ReactQuill
                                        ref={quillRef}
                                        theme="snow"
                                        value={content}
                                        onChange={setContent}
                                        modules={modules}
                                        formats={formats}
                                        className="min-h-[300px] [&_.ql-toolbar]:border-none [&_.ql-container]:border-none"
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
                                {loading ? 'Saving…' : 'Save as Draft'}
                            </Button>
                            <Button
                                onClick={() => handleSubmit(true)}
                                disabled={loading}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                {loading ? 'Publishing…' : published ? 'Update & Publish' : 'Publish'}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>

            {/* Font styles injected inline so they work inside the Dialog's shadow */}
            <style>{fontStyles}</style>
        </Dialog>
    );
};
