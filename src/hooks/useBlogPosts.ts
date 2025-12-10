import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost, CreateBlogPostData, UpdateBlogPostData } from '@/types/blog';

export const useBlogPosts = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch all posts (for admin - includes drafts)
    const fetchAllPosts = async () => {
        try {
            setLoading(true);
            const { data, error } = await (supabase as any)
                .from('blog_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error fetching posts',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch published posts only (for public view)
    const fetchPublishedPosts = async () => {
        try {
            setLoading(true);
            const { data, error } = await (supabase as any)
                .from('blog_posts')
                .select('*')
                .eq('published', true)
                .order('published_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error fetching posts',
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    // Fetch single post by slug
    const fetchPostBySlug = async (slug: string): Promise<BlogPost | null> => {
        try {
            const { data, error } = await (supabase as any)
                .from('blog_posts')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            return data;
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error fetching post',
                description: error.message,
            });
            return null;
        }
    };

    // Create new post
    const createPost = async (postData: CreateBlogPostData): Promise<BlogPost | null> => {
        try {
            const { data, error } = await (supabase as any)
                .from('blog_posts')
                .insert([postData])
                .select()
                .single();

            if (error) throw error;

            toast({
                title: 'Post created',
                description: 'Your blog post has been created successfully.',
            });

            // Refresh posts list
            await fetchAllPosts();
            return data;
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error creating post',
                description: error.message,
            });
            return null;
        }
    };

    // Update existing post
    const updatePost = async (postData: UpdateBlogPostData): Promise<BlogPost | null> => {
        try {
            const { id, ...updates } = postData;
            const { data, error } = await (supabase as any)
                .from('blog_posts')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            toast({
                title: 'Post updated',
                description: 'Your blog post has been updated successfully.',
            });

            // Refresh posts list
            await fetchAllPosts();
            return data;
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error updating post',
                description: error.message,
            });
            return null;
        }
    };

    // Delete post
    const deletePost = async (id: string): Promise<boolean> => {
        try {
            const { error } = await (supabase as any)
                .from('blog_posts')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast({
                title: 'Post deleted',
                description: 'Your blog post has been deleted successfully.',
            });

            // Refresh posts list
            await fetchAllPosts();
            return true;
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error deleting post',
                description: error.message,
            });
            return false;
        }
    };

    // Upload image to Supabase Storage
    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('blog-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage
                .from('blog-images')
                .getPublicUrl(filePath);

            return data.publicUrl;
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error uploading image',
                description: error.message,
            });
            return null;
        }
    };

    // Generate slug from title
    const generateSlug = (title: string): string => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    // Toggle Like
    const toggleLike = async (postId: string): Promise<boolean> => {
        if (!user) {
            toast({
                title: 'Sign in required',
                description: 'Please sign in to like posts.',
            });
            return false;
        }

        try {
            // Check if already liked
            const { data: existingLike } = await (supabase as any)
                .from('blog_post_likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', user.id)
                .single();

            if (existingLike) {
                // Unlike
                const { error } = await (supabase as any)
                    .from('blog_post_likes')
                    .delete()
                    .eq('id', existingLike.id);
                if (error) throw error;
                return false; // Not liked anymore
            } else {
                // Like
                const { error } = await (supabase as any)
                    .from('blog_post_likes')
                    .insert([{ post_id: postId, user_id: user.id }]);
                if (error) throw error;
                return true; // Liked
            }
        } catch (error: any) {
            console.error('Error toggling like:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update like status.',
            });
            throw error;
        }
    };

    // Get Interactions
    const getPostInteractions = async (postId: string) => {
        try {
            // Get Likes Count
            const { count: likesCount, error: likesError } = await (supabase as any)
                .from('blog_post_likes')
                .select('id', { count: 'exact', head: true })
                .eq('post_id', postId);

            if (likesError) throw likesError;

            // Check if user liked
            let isLiked = false;
            if (user) {
                const { data: userLike } = await (supabase as any)
                    .from('blog_post_likes')
                    .select('id')
                    .eq('post_id', postId)
                    .eq('user_id', user.id)
                    .single();
                isLiked = !!userLike;
            }

            // Get Comments (Raw)
            const { data: commentsData, error: commentsError } = await (supabase as any)
                .from('blog_post_comments')
                .select('*')
                .eq('post_id', postId)
                .order('created_at', { ascending: false });

            if (commentsError) throw commentsError;

            // Manual join with profiles to get user names
            const userIds = [...new Set((commentsData || []).map((c: any) => c.user_id))];
            let profilesMap: Record<string, any> = {};

            if (userIds.length > 0) {
                const { data: profiles, error: profilesError } = await (supabase as any)
                    .from('profiles')
                    .select('user_id, preferred_name') // dependent on schema, usually it's user_id or id
                    .in('user_id', userIds);

                if (!profilesError && profiles) {
                    profiles.forEach((p: any) => {
                        profilesMap[p.user_id] = p;
                    });
                }
            }

            // Map comments to include user data structure expected by UI
            const comments = (commentsData || []).map((comment: any) => {
                const profile = profilesMap[comment.user_id];
                return {
                    ...comment,
                    user: {
                        email: '', // Privacy: email hidden
                        user_metadata: {
                            preferred_name: profile?.preferred_name || 'User',
                            avatar_url: null
                        }
                    }
                };
            });

            return {
                likesCount: likesCount || 0,
                isLiked,
                comments: comments || []
            };
        } catch (error: any) {
            console.error('Error fetching interactions:', error);
            return { likesCount: 0, isLiked: false, comments: [] };
        }
    };

    // Add Comment
    const addComment = async (postId: string, content: string) => {
        if (!user) return null;
        try {
            // 1. Insert Comment
            const { data: commentData, error } = await (supabase as any)
                .from('blog_post_comments')
                .insert([{
                    post_id: postId,
                    user_id: user.id,
                    content
                }])
                .select()
                .single();

            if (error) throw error;

            // 2. Mock return structure (since we know the current user)
            // We can fetch profile if we want to be 100% sure, but using auth context is faster for UI
            return {
                ...commentData,
                user: {
                    email: user.email,
                    user_metadata: {
                        preferred_name: user.user_metadata?.preferred_name || user.email?.split('@')[0],
                        avatar_url: user.user_metadata?.avatar_url
                    }
                }
            };
        } catch (error: any) {
            console.error('Error adding comment:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not post comment.',
            });
            return null;
        }
    };

    // Global Analytics
    const fetchAnalytics = async () => {
        try {
            const { count: postsCount } = await (supabase as any)
                .from('blog_posts')
                .select('*', { count: 'exact', head: true });

            const { count: likesCount } = await (supabase as any)
                .from('blog_post_likes')
                .select('*', { count: 'exact', head: true });

            const { count: commentsCount } = await (supabase as any)
                .from('blog_post_comments')
                .select('*', { count: 'exact', head: true });

            return {
                totalPosts: postsCount || 0,
                totalLikes: likesCount || 0,
                totalComments: commentsCount || 0
            };
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return { totalPosts: 0, totalLikes: 0, totalComments: 0 };
        }
    };

    // Delete Comment
    const deleteComment = async (commentId: string) => {
        try {
            const { error } = await (supabase as any)
                .from('blog_post_comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;
            return true;
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not delete comment.',
            });
            return false;
        }
    };

    // Auto-fetch posts on mount (if user is authenticated, fetch all; otherwise fetch published)
    useEffect(() => {
        if (user) {
            fetchAllPosts();
        } else {
            fetchPublishedPosts();
        }
    }, [user]);

    return {
        posts,
        loading,
        fetchAllPosts,
        fetchPublishedPosts,
        fetchPostBySlug,
        createPost,
        updatePost,
        deletePost,
        uploadImage,
        generateSlug,
        toggleLike,
        getPostInteractions,
        addComment,
        deleteComment,
        fetchAnalytics
    };
};
