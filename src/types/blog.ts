export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    image_url?: string;
    author: string;
    category?: string;
    tags?: string[];
    published: boolean;
    published_at?: string;
    created_at: string;
    updated_at: string;
}

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    created_at: string;
}

export interface CreateBlogPostData {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    image_url?: string;
    author?: string;
    category?: string;
    tags?: string[];
    published?: boolean;
    published_at?: string;
}

export interface UpdateBlogPostData extends Partial<CreateBlogPostData> {
    id: string;
}

export interface BlogPostLike {
    post_id: string;
    user_id: string;
    created_at: string;
}

export interface BlogPostComment {
    id: string;
    post_id: string;
    user_id: string;
    content: string;
    created_at: string;
    user?: {
        email: string;
        user_metadata?: {
            preferred_name?: string;
            avatar_url?: string;
        };
    };
}
