import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { BlogPost, CreateBlogPostData, UpdateBlogPostData } from '@/types/blog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAdminEmail } from '@/utils/admin';

export const useBlogPosts = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const isAdmin = isAdminEmail(user?.email);

    // Query Keys
    const BLOG_KEYS = {
        all: ['blog_posts'] as const,
        lists: () => [...BLOG_KEYS.all, 'list'] as const,
        list: (filter: string) => [...BLOG_KEYS.lists(), filter] as const,
        details: () => [...BLOG_KEYS.all, 'detail'] as const,
        detail: (slug: string) => [...BLOG_KEYS.details(), slug] as const,
        analytics: ['blog_analytics'] as const,
        interactions: (postId: string) => [...BLOG_KEYS.all, 'interactions', postId] as const,
    };

    // --- Queries ---

    // Fetch posts:
    //  - Super-admins see ALL posts (including drafts) so the blog admin table is complete.
    //  - Everyone else (guests AND regular logged-in users) only sees published=true.
    const queryFilter = isAdmin ? 'all' : 'published';
    const { data: posts = [], isLoading: loading } = useQuery({
        queryKey: BLOG_KEYS.list(queryFilter),
        queryFn: async () => {
            let query = (supabase as any).from('blog_posts').select('*');

            if (isAdmin) {
                query = query.order('created_at', { ascending: false });
            } else {
                query = query.eq('published', true).order('published_at', { ascending: false });
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as BlogPost[];
        },
    });

    // Fetch single post by slug
    const fetchPostBySlug = async (slug: string): Promise<BlogPost | null> => {
        try {
            const { data, error } = await (supabase as any)
                .from('blog_posts')
                .select('*')
                .eq('slug', slug)
                .maybeSingle();

            if (error) throw error;
            return data;
        } catch (error: any) {
            console.error('Error fetching post by slug:', error);
            return null;
        }
    };

    // --- Specialized Hooks for Pages ---
    const useBlogPost = (slug: string) => useQuery({
        queryKey: BLOG_KEYS.detail(slug),
        queryFn: () => fetchPostBySlug(slug),
        enabled: !!slug,
    });

    const useRelatedPosts = (category: string, excludeId: string) => useQuery({
        queryKey: [...BLOG_KEYS.all, 'related', category, excludeId],
        queryFn: async () => {
            if (!category) return [];
            const { data, error } = await (supabase as any)
                .from('blog_posts')
                .select('*')
                .eq('category', category)
                .eq('published', true)
                .neq('id', excludeId)
                .limit(3);
            if (error) throw error;
            return data as BlogPost[];
        },
        enabled: !!category && !!excludeId,
    });

    // Global Analytics Query
    const analyticsQuery = useQuery({
        queryKey: BLOG_KEYS.analytics,
        queryFn: async () => {
            const [postsRes, likesRes, commentsRes] = await Promise.all([
                (supabase as any).from('blog_posts').select('*', { count: 'exact', head: true }),
                (supabase as any).from('blog_post_likes').select('id', { count: 'exact', head: true }),
                (supabase as any).from('blog_post_comments').select('id', { count: 'exact', head: true }),
            ]);

            return {
                totalPosts: postsRes.count || 0,
                totalLikes: likesRes.count || 0,
                totalComments: commentsRes.count || 0
            };
        },
    });

    // --- Mutations ---

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: BLOG_KEYS.all });
        queryClient.invalidateQueries({ queryKey: BLOG_KEYS.analytics });
    };

    // Create
    const createPostMutation = useMutation({
        mutationFn: async (postData: CreateBlogPostData) => {
            const { data, error } = await (supabase as any)
                .from('blog_posts')
                .insert([postData])
                .select('id, slug'); // Minimum fields to avoid timeout
            if (error) {
                console.error('Create Post Error:', error);
                throw error;
            }
            return data?.[0] as BlogPost;
        },
        onSuccess: () => {
            toast({ title: 'Post created', description: 'Your blog post has been created.' });
            invalidateAll();
        },
        onError: (error: any) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        },
    });

    // Update
    const updatePostMutation = useMutation({
        mutationFn: async (postData: UpdateBlogPostData) => {
            const { id, ...updates } = postData;
            const { data, error } = await (supabase as any)
                .from('blog_posts')
                .update(updates)
                .eq('id', id)
                .select('id, slug'); // Minimum fields to avoid timeout
            if (error) {
                console.error('Update Post Error:', error);
                throw error;
            }
            return data?.[0] as BlogPost;
        },
        onSuccess: (data) => {
            toast({ title: 'Post updated', description: 'Your blog post has been updated.' });
            invalidateAll();
            queryClient.invalidateQueries({ queryKey: BLOG_KEYS.detail(data.slug) });
        },
        onError: (error: any) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        },
    });

    // Delete
    const deletePostMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any).from('blog_posts').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast({ title: 'Post deleted', description: 'Post removed successfully.' });
            invalidateAll();
        },
    });

    // Toggle published status (Publish / Unpublish)
    const togglePublishMutation = useMutation({
        mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
            const updates: Record<string, any> = { published };
            if (published) {
                updates.published_at = new Date().toISOString();
            }
            const { error } = await (supabase as any)
                .from('blog_posts')
                .update(updates)
                .eq('id', id);
            if (error) throw error;
            return { id, published };
        },
        onSuccess: (_, { published }) => {
            toast({
                title: published ? 'Post published' : 'Post unpublished',
                description: published
                    ? 'The post is now live.'
                    : 'The post has been unpublished and hidden from readers.',
            });
            invalidateAll();
        },
        onError: (error: any) => {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        },
    });

    // Other actions (unchanged logic but could be refactored further)
    const uploadImage = async (file: File): Promise<string | null> => {
        try {
            console.log('Attempting Cloudinary upload with preset:', 'Penny Pal Blogs');
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'Penny Pal Blogs'); 
            formData.append('cloud_name', 'dv8x0tidi');

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/dv8x0tidi/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Cloudinary API Error:', errorData);
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const data = await response.json();
            console.log('Cloudinary Upload Success:', data.secure_url);
            return data.secure_url;
        } catch (error: any) {
            console.error('Cloudinary Upload Error:', error);
            toast({ variant: 'destructive', title: 'Upload failed', description: error.message });
            return null;
        }
    };

    const toggleLike = async (postId: string) => {
        if (!user) return false;
        try {
            const { data: existingLike } = await (supabase as any)
                .from('blog_post_likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', user.id)
                .maybeSingle();

            if (existingLike) {
                await (supabase as any).from('blog_post_likes').delete().eq('id', existingLike.id);
            } else {
                await (supabase as any).from('blog_post_likes').insert([{ post_id: postId, user_id: user.id }]);
            }
            queryClient.invalidateQueries({ queryKey: BLOG_KEYS.interactions(postId) });
            queryClient.invalidateQueries({ queryKey: BLOG_KEYS.analytics });
            return !existingLike;
        } catch (err) {
            console.error('Error toggling like:', err);
            throw err;
        }
    };

    const getPostInteractions = async (postId: string) => {
        try {
            const [likesRes, userLikeRes, commentsRes] = await Promise.all([
                (supabase as any).from('blog_post_likes').select('id', { count: 'exact', head: true }).eq('post_id', postId),
                user ? (supabase as any).from('blog_post_likes').select('id').eq('post_id', postId).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
                (supabase as any).from('blog_post_comments').select('*').eq('post_id', postId).order('created_at', { ascending: false })
            ]);
            
            const likesCount = likesRes.count || 0;
            const isLiked = !!userLikeRes.data;
            const commentsData = commentsRes.data || [];

            // Fast profile mapping
            const userIds = [...new Set(commentsData.map((c: any) => c.user_id))];
            let profilesMap: Record<string, any> = {};
            if (userIds.length > 0) {
                const { data: profiles } = await (supabase as any).from('profiles').select('user_id, preferred_name').in('user_id', userIds);
                profiles?.forEach((p: any) => { profilesMap[p.user_id] = p; });
            }

            const comments = commentsData.map((comment: any) => ({
                ...comment,
                user: {
                    user_metadata: {
                        preferred_name: profilesMap[comment.user_id]?.preferred_name || 'User'
                    }
                }
            }));

            return { likesCount, isLiked, comments };
        } catch (err) {
            console.error('Error fetching interactions:', err);
            return { likesCount: 0, isLiked: false, comments: [] };
        }
    };

    const addComment = async (postId: string, content: string) => {
        if (!user) return null;
        try {
            const { data, error } = await (supabase as any)
                .from('blog_post_comments')
                .insert([{ post_id: postId, user_id: user.id, content }])
                .select()
                .single();
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: BLOG_KEYS.interactions(postId) });
            queryClient.invalidateQueries({ queryKey: BLOG_KEYS.analytics });
            return { ...data, user: { user_metadata: { preferred_name: user.user_metadata?.preferred_name || user.email?.split('@')[0] } } };
        } catch (err) { 
            console.error('Error adding comment:', err);
            return null; 
        }
    };

    return {
        posts,
        loading,
        isAdmin,
        fetchPostBySlug,
        createPost: createPostMutation.mutateAsync,
        updatePost: updatePostMutation.mutateAsync,
        deletePost: deletePostMutation.mutateAsync,
        togglePublish: togglePublishMutation.mutateAsync,
        uploadImage,
        generateSlug: (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        toggleLike,
        getPostInteractions,
        addComment,
        fetchAnalytics: async () => analyticsQuery.data || { totalPosts: 0, totalLikes: 0, totalComments: 0 },
        useBlogPost,
        useRelatedPosts,
        // Add refetch for convenience
        refetchPosts: () => queryClient.invalidateQueries({ queryKey: BLOG_KEYS.lists() }),
        fetchAllPosts: () => queryClient.invalidateQueries({ queryKey: BLOG_KEYS.list('all') }),
        fetchPublishedPosts: () => queryClient.invalidateQueries({ queryKey: BLOG_KEYS.list('published') }),
    };
};
