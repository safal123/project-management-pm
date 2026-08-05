import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { LoaderCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LikeButton } from '@/components/like-button';
import { Comment } from '@/types';

interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  onReply?: (parentCommentId: string, body: string) => Promise<void>;
  onEdit: (commentId: string, body: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onToggleLike: (commentId: string) => Promise<void>;
}

export default function CommentItem({
  comment,
  isReply = false,
  onReply,
  onEdit,
  onDelete,
  onToggleLike,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.body);
  const [isReplying, setIsReplying] = useState(false);
  const [replyValue, setReplyValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveEdit = async () => {
    const nextBody = editValue.trim();

    if (!nextBody || nextBody === comment.body) {
      setEditValue(comment.body);
      setIsEditing(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await onEdit(comment.id, nextBody);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;

    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitReply = async () => {
    const body = replyValue.trim();
    if (!body || !onReply) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.id, body);
      setReplyValue('');
      setIsReplying(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar className={isReply ? 'h-6 w-6 flex-shrink-0' : 'h-8 w-8 flex-shrink-0'}>
        <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
        <AvatarFallback className="text-xs">
          {comment.user.name?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{comment.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>

        {isEditing ? (
          <div className="mt-1 space-y-2">
            <Textarea
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              disabled={isSubmitting}
              className="resize-none text-sm min-h-[60px]"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSaveEdit();
                }
                if (e.key === 'Escape') {
                  setEditValue(comment.body);
                  setIsEditing(false);
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit} disabled={isSubmitting}>
                {isSubmitting && <LoaderCircle className="h-3 w-3 animate-spin mr-1" />}
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={isSubmitting}
                onClick={() => {
                  setEditValue(comment.body);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{comment.body}</p>
        )}

        {!isEditing && (
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <LikeButton
              likeableType="comment"
              likeableId={comment.id}
              isLiked={!!comment.is_liked_by_user}
              likesCount={comment.likes_count ?? 0}
              size="sm"
              onToggle={() => onToggleLike(comment.id)}
            />
            {!isReply && onReply && (
              <button
                type="button"
                className="hover:text-foreground cursor-pointer"
                onClick={() => setIsReplying((value) => !value)}
              >
                Reply
              </button>
            )}
            {comment.can_edit && (
              <button
                type="button"
                className="hover:text-foreground cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            )}
            {comment.can_delete && (
              <button
                type="button"
                className="hover:text-destructive cursor-pointer disabled:opacity-50"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
            )}
          </div>
        )}

        {isReplying && (
          <div className="mt-2 space-y-2">
            <Textarea
              autoFocus
              value={replyValue}
              onChange={(e) => setReplyValue(e.target.value)}
              disabled={isSubmitting}
              placeholder={`Reply to ${comment.user.name}`}
              className="resize-none text-sm min-h-[50px]"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitReply();
                }
                if (e.key === 'Escape') {
                  setReplyValue('');
                  setIsReplying(false);
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmitReply} disabled={isSubmitting || !replyValue.trim()}>
                {isSubmitting && <LoaderCircle className="h-3 w-3 animate-spin mr-1" />}
                Reply
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={isSubmitting}
                onClick={() => {
                  setReplyValue('');
                  setIsReplying(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!isReply && comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 border-l border-border pl-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isReply
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleLike={onToggleLike}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
