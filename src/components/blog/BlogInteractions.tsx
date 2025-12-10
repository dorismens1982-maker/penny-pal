import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Share2, MessageCircle } from 'lucide-react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogInteractionsProps {
    postId: string;
    onScrollToComments?: () => void;
}

export const BlogInteractions = ({ postId, onScrollToComments }: BlogInteractionsProps) => {
    const { toggleLike, getPostInteractions } = useBlogPosts();
    const { toast } = useToast();
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [commentCount, setCommentCount] = useState(0);

    useEffect(() => {
        const loadInteractions = async () => {
            const data = await getPostInteractions(postId);
            setLikes(data.likesCount);
            setIsLiked(data.isLiked);
            setCommentCount(data.comments.length);
        };
        loadInteractions();
    }, [postId]);

    const handleLike = async () => {
        // Optimistic update
        const previousLiked = isLiked;
        const previousLikes = likes;

        setIsLiked(!previousLiked);
        setLikes(previousLiked ? previousLikes - 1 : previousLikes + 1);

        try {
            await toggleLike(postId);
        } catch (error) {
            // Revert on error
            setIsLiked(previousLiked);
            setLikes(previousLikes);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: 'Link copied',
                description: 'Article link copied to clipboard',
            });
        }
    };

    return (
        <div className="flex items-center gap-2 py-6 border-t border-b border-slate-100 my-8">
            <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                    "rounded-full gap-2 transition-all duration-300",
                    isLiked ? "text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600" : "text-slate-600 hover:bg-slate-100"
                )}
            >
                <div className="relative">
                    <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
                    <AnimatePresence>
                        {isLiked && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-red-500 rounded-full"
                            />
                        )}
                    </AnimatePresence>
                </div>
                <span className="font-medium">{likes}</span>
            </Button>

            <Button
                variant="ghost"
                size="sm"
                onClick={onScrollToComments}
                className="rounded-full gap-2 text-slate-600 hover:bg-slate-100"
            >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">{commentCount}</span>
            </Button>

            <div className="flex-1" />

            <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="rounded-full gap-2 text-slate-600 hover:bg-slate-100"
            >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">Share</span>
            </Button>
        </div>
    );
};
