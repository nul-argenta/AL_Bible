import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Send, User, MessageSquare } from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import { AppHeader } from "@/components/AppHeader";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
    id: number;
    user_id: number;
    username: string;
    display_name: string;
    content: string;
    parent_id: number | null;
    verse_id: number | null;
    verse_chapter: number | null;
    verse_num: number | null;
    book_name: string | null;
    like_count: number;
    has_liked: number | null;
    created_at: string;
    replies?: Post[];
}

export default function CommunityPage() {
    const { data: rawPosts, isLoading } = useQuery<Post[]>({
        queryKey: ["posts"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/community/posts");
            return res.json();
        }
    });

    // Build Thread Tree
    const posts = (() => {
        if (!rawPosts) return [];
        const postMap = new Map<number, Post>();
        rawPosts.forEach(p => postMap.set(p.id, { ...p, replies: [] }));

        const topLevel: Post[] = [];
        rawPosts.forEach(p => {
            const post = postMap.get(p.id)!;
            if (p.parent_id) {
                const parent = postMap.get(p.parent_id);
                if (parent && parent.replies) parent.replies.push(post);
            } else {
                topLevel.push(post);
            }
        });
        return topLevel;
    })();

    const [moderationError, setModerationError] = useState<string | null>(null);

    const postMutation = useMutation({
        mutationFn: async ({ content, parentId }: { content: string, parentId?: number }) => {
            await apiRequest("POST", "/api/community/posts", { content, parentId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            setNewPost("");
            setReplyToId(null);
            setModerationError(null);
        },
        onError: (error: Error) => {
            // Parse moderation rejection from the error message
            try {
                // apiRequest throws "403: {json}" — extract the JSON part
                const jsonStr = error.message.replace(/^\d+:\s*/, "");
                const parsed = JSON.parse(jsonStr);
                if (parsed.status === "rejected") {
                    setModerationError(parsed.message || "Your post was not approved by our moderation system.");
                    return;
                }
            } catch {
                // Not a moderation error
            }
            setModerationError("Failed to submit post. Please try again.");
        }
    });

    const likeMutation = useMutation({
        mutationFn: async ({ postId, isLiking }: { postId: number, isLiking: boolean }) => {
            if (isLiking) {
                await apiRequest("POST", `/api/community/posts/${postId}/like`);
            } else {
                await apiRequest("DELETE", `/api/community/posts/${postId}/like`);
            }
        },
        onMutate: async ({ postId, isLiking }) => {
            // Optimistic Update
            await queryClient.cancelQueries({ queryKey: ["posts"] });
            const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);

            if (previousPosts) {
                queryClient.setQueryData<Post[]>(["posts"], previousPosts.map(p => {
                    if (p.id === postId) {
                        return {
                            ...p,
                            has_liked: isLiking ? 1 : null,
                            like_count: p.like_count + (isLiking ? 1 : -1)
                        };
                    }
                    return p;
                }));
            }
            return { previousPosts };
        },
        onError: (_err, _newVal, context) => {
            if (context?.previousPosts) {
                queryClient.setQueryData(["posts"], context.previousPosts);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
    });

    const [newPost, setNewPost] = useState("");
    const [replyToId, setReplyToId] = useState<number | null>(null);

    const handleSubmit = (e: React.FormEvent, parentId?: number) => {
        e.preventDefault();
        if (newPost.trim()) {
            postMutation.mutate({ content: newPost, parentId });
        }
    };

    const PostItem = ({ post, isReply = false }: { post: Post, isReply?: boolean }) => {
        const isLiking = post.has_liked === 1;

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`bg-card border rounded-lg p-4 shadow-sm ${isReply ? 'ml-6 md:ml-12 border-l-4 border-l-primary/30' : ''}`}
            >
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-muted p-1 rounded-full text-foreground/70">
                        <User size={16} />
                    </div>
                    <span className="font-semibold text-sm">{post.display_name || post.username}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(post.created_at).toLocaleDateString()}
                    </span>
                </div>

                {post.book_name && (
                    <div className="mb-3 px-3 py-1.5 bg-primary/10 border-l-2 border-primary rounded text-xs font-medium text-primary inline-flex items-center gap-1.5">
                        <BookOpen size={12} />
                        {post.book_name} {post.verse_chapter}:{post.verse_num}
                    </div>
                )}

                <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => likeMutation.mutate({ postId: post.id, isLiking: !isLiking })}
                        className={`flex items-center gap-1.5 transition-colors hover:text-red-500 ${isLiking ? 'text-red-500 font-medium' : ''}`}
                    >
                        <Heart size={14} className={isLiking ? 'fill-red-500' : ''} />
                        {post.like_count > 0 ? post.like_count : 'Like'}
                    </motion.button>
                    {!isReply && (
                        <button
                            onClick={() => setReplyToId(replyToId === post.id ? null : post.id)}
                            className="flex items-center gap-1.5 transition-colors hover:text-primary"
                        >
                            <MessageSquare size={14} />
                            {post.replies?.length || 'Reply'}
                        </button>
                    )}
                </div>

                {replyToId === post.id && !isReply && (
                    <div className="mt-4 pl-4 border-l-2">
                        <form onSubmit={(e) => handleSubmit(e, post.id)} className="flex gap-2">
                            <input
                                autoFocus
                                className="flex-1 bg-background border border-primary/20 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-primary transition-colors"
                                placeholder={`Replying to ${post.display_name || post.username}...`}
                                value={newPost}
                                onChange={(e) => setNewPost(e.target.value)}
                                disabled={postMutation.isPending}
                            />
                            <Button type="submit" size="sm" disabled={postMutation.isPending || !newPost.trim()}>
                                Reply
                            </Button>
                        </form>
                    </div>
                )}

                {/* Render Replies */}
                {post.replies && post.replies.length > 0 && (
                    <div className="mt-4 space-y-3">
                        {post.replies.map(reply => (
                            <PostItem key={reply.id} post={reply} isReply={true} />
                        ))}
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <PageWrapper className="bg-background text-foreground">
            <AppHeader title="Community Hub" />

            <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6 overflow-y-auto">

                {/* Create Top-Level Post */}
                <div className="bg-card border rounded-lg p-4 shadow-sm mb-2">
                    <form onSubmit={(e) => handleSubmit(e)} className="flex gap-2">
                        <input
                            className="flex-1 bg-background border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Share your thoughts or prayer requests..."
                            value={!replyToId ? newPost : ""}
                            onChange={(e) => {
                                setReplyToId(null);
                                setNewPost(e.target.value);
                            }}
                            disabled={postMutation.isPending}
                        />
                        <Button type="submit" disabled={postMutation.isPending || (!!replyToId) || !newPost.trim()}>
                            <Send size={16} />
                        </Button>
                    </form>
                    {!replyToId && newPost.length > 0 && (
                        <p className={`text-xs mt-1.5 text-right ${newPost.length > 1800 ? "text-destructive" : "text-muted-foreground"}`}>
                            {newPost.length}/2000
                        </p>
                    )}
                </div>

                {/* Moderation Rejection Banner */}
                <AnimatePresence>
                    {moderationError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 flex items-start gap-3"
                        >
                            <span className="text-destructive text-lg mt-0.5">🛡️</span>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-destructive">Post Not Approved</p>
                                <p className="text-xs text-destructive/80 mt-0.5">{moderationError}</p>
                            </div>
                            <button onClick={() => setModerationError(null)} className="text-destructive/60 hover:text-destructive text-sm font-bold">✕</button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Feed */}
                <div className="space-y-4 pb-12">
                    {isLoading ? (
                        <div className="text-center py-10 text-muted-foreground animate-pulse">Loading community feed...</div>
                    ) : posts && posts.length > 0 ? (
                        <AnimatePresence mode="popLayout">
                            {posts.map((post) => (
                                <PostItem key={post.id} post={post} />
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            No posts yet. Be the first to share!
                        </div>
                    )}
                </div>

            </main>
        </PageWrapper>
    );
}
