import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Send } from 'lucide-react';
import { BlogPostComment } from '@/types/blog';

interface CommentsSectionProps {
    postId: string;
}

export const CommentsSection = ({ postId }: CommentsSectionProps) => {
    const { user } = useAuth();
    const { getPostInteractions, addComment, deleteComment } = useBlogPosts();
    const [comments, setComments] = useState<BlogPostComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const loadComments = async () => {
        const data = await getPostInteractions(postId);
        setComments(data.comments);
    };

    useEffect(() => {
        loadComments();
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        const added = await addComment(postId, newComment);
        if (added) {
            setNewComment('');
            loadComments(); // Refresh list
        }
        setSubmitting(false);
    };

    const handleDelete = async (commentId: string) => {
        if (confirm('Are you sure you want to delete this comment?')) {
            const success = await deleteComment(commentId);
            if (success) {
                setComments(comments.filter(c => c.id !== commentId));
            }
        }
    };

    return (
        <div className="space-y-8" id="comments-section">
            <h3 className="text-2xl font-bold text-slate-900">
                Comments ({comments.length})
            </h3>

            {/* Comment Form */}
            <div className="flex gap-4">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user?.email?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    {user ? (
                        <form onSubmit={handleSubmit}>
                            <Textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Share your thoughts..."
                                className="min-h-[100px] mb-2"
                            />
                            <div className="flex justify-end">
                                <Button type="submit" disabled={submitting || !newComment.trim()}>
                                    {submitting ? 'Posting...' : 'Post Comment'}
                                    <Send className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-slate-50 p-4 rounded-lg text-slate-500 text-sm">
                            Please sign in to join the conversation.
                        </div>
                    )}
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 group">
                        <Avatar className="w-10 h-10 mt-1">
                            <AvatarImage src={comment.user?.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                                {(comment.user?.user_metadata?.preferred_name || comment.user?.email || '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-900">
                                        {comment.user?.user_metadata?.preferred_name || comment.user?.email?.split('@')[0] || 'User'}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-slate-700 leading-relaxed text-sm">
                                    {comment.content}
                                </p>
                            </div>
                            {user?.id === comment.user_id && (
                                <div className="flex justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(comment.id)}
                                        className="text-xs text-red-500 hover:underline flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
