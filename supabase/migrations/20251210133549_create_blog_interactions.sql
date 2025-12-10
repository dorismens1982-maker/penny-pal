-- Create blog_post_likes table
create table if not exists public.blog_post_likes (
    id uuid not null default gen_random_uuid(),
    post_id uuid not null references public.blog_posts(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (id),
    unique(post_id, user_id)
);

-- Create blog_post_comments table
create table if not exists public.blog_post_comments (
    id uuid not null default gen_random_uuid(),
    post_id uuid not null references public.blog_posts(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    content text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    primary key (id)
);

-- Enable RLS
alter table public.blog_post_likes enable row level security;
alter table public.blog_post_comments enable row level security;

-- Policies for Likes
create policy "Likes are visible to everyone"
    on public.blog_post_likes for select
    using (true);

create policy "Authenticated users can toggle likes"
    on public.blog_post_likes for insert
    with check (auth.uid() = user_id);

create policy "Users can remove their own likes"
    on public.blog_post_likes for delete
    using (auth.uid() = user_id);

-- Policies for Comments
create policy "Comments are visible to everyone"
    on public.blog_post_comments for select
    using (true);

create policy "Authenticated users can comment"
    on public.blog_post_comments for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own comments"
    on public.blog_post_comments for update
    using (auth.uid() = user_id);

create policy "Users can delete their own comments"
    on public.blog_post_comments for delete
    using (auth.uid() = user_id);
    
-- Realtime
alter publication supabase_realtime add table public.blog_post_likes;
alter publication supabase_realtime add table public.blog_post_comments;
