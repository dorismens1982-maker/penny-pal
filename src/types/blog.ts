export interface BlogSeries {
    id: string;
    title: string;
    slug: string;
    description?: string;
    excerpt?: string;
    image_url?: string;
    published: boolean;
    published_at?: string;
    created_at: string;
    updated_at: string;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    image_url?: string;
    author: string;
    author_name?: string;
    read_time?: string;
    category?: string;
    tags?: string[];
    published: boolean;
    published_at?: string;
    created_at: string;
    updated_at: string;
    series_id?: string;
    series_order?: number;
    author_roles?: {
        role: string;
    };
    author_profile?: {
        full_name: string | null;
    };
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
    author_name?: string;
    read_time?: string;
    category?: string;
    tags?: string[];
    published?: boolean;
    published_at?: string;
    series_id?: string;
    series_order?: number;
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
