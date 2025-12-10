import React, { useState } from 'react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft, Pencil, Trash2, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BlogPostEditor } from '@/components/blog/BlogPostEditor';
import type { BlogPost } from '@/types/blog';
import { isAdminEmail } from '@/utils/admin';

export const BlogAdmin = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { posts, loading, deletePost, fetchAllPosts } = useBlogPosts();
    const [showEditor, setShowEditor] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | undefined>();

    // Check admin access
    const hasAdminAccess = isAdminEmail(user?.email);

    // Show access denied if not admin
    if (!hasAdminAccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <Shield className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
                    <p className="text-slate-600">
                        You don't have permission to access the Blog Admin.
                        This area is restricted to authorized administrators only.
                    </p>
                    <Button onClick={() => navigate('/')} className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setShowEditor(true);
    };

    const handleCloseEditor = () => {
        setShowEditor(false);
        setEditingPost(undefined);
    };

    const handleSave = () => {
        fetchAllPosts();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this post?')) {
            await deletePost(id);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/')}
                                className="gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to App
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Blog Admin</h1>
                                <p className="text-sm text-slate-500">Manage your blog posts</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowEditor(true)}
                            className="gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Post
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Loading posts...</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                        <p className="text-slate-500 mb-4">No blog posts yet</p>
                        <Button onClick={() => setShowEditor(true)} className="gap-2">
                            <Plus className="w-4 h-4" />
                            Create Your First Post
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-slate-200">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {posts.map((post) => (
                                        <tr key={post.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {post.image_url && (
                                                        <img
                                                            src={post.image_url}
                                                            alt={post.title}
                                                            className="w-12 h-12 rounded object-cover"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-slate-900">{post.title}</p>
                                                        <p className="text-sm text-slate-500">{post.slug}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.published
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    {post.published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {post.category || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(post)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(post.id)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Editor Modal */}
            {showEditor && (
                <BlogPostEditor
                    post={editingPost}
                    onClose={handleCloseEditor}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};
