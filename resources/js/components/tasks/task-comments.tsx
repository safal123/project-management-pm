import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { LoaderCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { usePage } from '@inertiajs/react';
import { Comment, SharedData, Task } from '@/types';
import CommentItem from './comment-item';

interface TaskCommentsProps {
  task: Task;
  className?: string;
}

export default function TaskComments({ task, className = '' }: TaskCommentsProps) {
  const { auth } = usePage<SharedData>().props;

  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get<{ data: Comment[] }>(route('comments.index'), {
        params: {
          commentable_type: 'task',
          commentable_id: task.id,
        },
      });
      setComments(data.data);
    } catch (error) {
      console.error('Failed to load comments', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [task.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    const body = newComment.trim();
    if (!body || isPosting) return;

    setIsPosting(true);
    try {
      const { data } = await axios.post<Comment>(route('comments.store'), {
        commentable_type: 'task',
        commentable_id: task.id,
        body,
      });
      setComments((current) => [...current, { ...data, replies: [] }]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment', error);
      toast.error('Failed to add comment');
    } finally {
      setIsPosting(false);
    }
  };

  const handleReply = async (parentCommentId: string, body: string) => {
    try {
      const { data } = await axios.post<Comment>(route('comments.store'), {
        commentable_type: 'task',
        commentable_id: task.id,
        parent_comment_id: parentCommentId,
        body,
      });
      setComments((current) =>
        current.map((comment) =>
          comment.id === parentCommentId
            ? { ...comment, replies: [...(comment.replies ?? []), data] }
            : comment
        )
      );
    } catch (error) {
      console.error('Failed to add reply', error);
      toast.error('Failed to add reply');
    }
  };

  const handleEdit = async (commentId: string, body: string) => {
    try {
      const { data } = await axios.patch<Comment>(
        route('comments.update', { comment: commentId }),
        { body }
      );
      setComments((current) =>
        current.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, body: data.body };
          }

          if (comment.replies?.some((reply) => reply.id === commentId)) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === commentId ? { ...reply, body: data.body } : reply
              ),
            };
          }

          return comment;
        })
      );
    } catch (error) {
      console.error('Failed to update comment', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await axios.delete(route('comments.destroy', { comment: commentId }));
      setComments((current) =>
        current
          .filter((comment) => comment.id !== commentId)
          .map((comment) => ({
            ...comment,
            replies: comment.replies?.filter((reply) => reply.id !== commentId),
          }))
      );
    } catch (error) {
      console.error('Failed to delete comment', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleToggleLike = async (commentId: string) => {
    try {
      const { data } = await axios.post<{ liked: boolean; likes_count: number }>(
        route('likes.toggle'),
        { likeable_type: 'comment', likeable_id: commentId }
      );

      setComments((current) =>
        current.map((comment) => {
          if (comment.id === commentId) {
            return { ...comment, is_liked_by_user: data.liked, likes_count: data.likes_count };
          }

          if (comment.replies?.some((reply) => reply.id === commentId)) {
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply.id === commentId
                  ? { ...reply, is_liked_by_user: data.liked, likes_count: data.likes_count }
                  : reply
              ),
            };
          }

          return comment;
        })
      );
    } catch (error) {
      console.error('Failed to toggle like', error);
      toast.error('Failed to update like');
      throw error;
    }
  };

  return (
    <div className={`flex min-h-0 flex-col gap-2 ${className}`}>
      <div className="flex shrink-0 gap-2">
        <Avatar className="h-7 w-7 flex-shrink-0">
          <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
          <AvatarFallback className="text-[10px]">
            {auth.user.name?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <Textarea
          placeholder="Add a comment"
          className="min-h-9 flex-1 resize-none px-2.5 py-2 text-[13px]"
          rows={2}
          value={newComment}
          disabled={isPosting}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
      </div>

      <ScrollArea className="min-h-0 flex-1 pr-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="py-4 text-center text-[13px] text-muted-foreground">
            No comments yet.
          </p>
        ) : (
          <div className="space-y-3 pb-1">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleLike={handleToggleLike}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
