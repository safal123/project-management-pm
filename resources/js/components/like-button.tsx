import { memo, useState, useCallback } from 'react'
import { router } from '@inertiajs/react'
import { ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export type LikeableType = 'task' | 'project' | 'event'

interface LikeButtonProps {
  likeableType: LikeableType
  likeableId: string
  isLiked?: boolean
  likesCount?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
  stopPropagation?: boolean
}

const iconSizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' } as const
const textSizes = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' } as const

export const LikeButton = memo(function LikeButton({
  likeableType,
  likeableId,
  isLiked: initialLiked = false,
  likesCount: initialCount = 0,
  className,
  size = 'md',
  stopPropagation = true,
}: LikeButtonProps) {
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null)
  const [optimisticCount, setOptimisticCount] = useState<number | null>(null)

  const isLiked = optimisticLiked ?? initialLiked
  const likesCount = optimisticCount ?? initialCount

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (stopPropagation) e.stopPropagation()

      const newLiked = !isLiked
      const newCount = newLiked ? likesCount + 1 : Math.max(0, likesCount - 1)
      setOptimisticLiked(newLiked)
      setOptimisticCount(newCount)

      router.post(
        route('likes.toggle'),
        { likeable_type: likeableType, likeable_id: likeableId },
        {
          preserveScroll: true,
          preserveState: true,
          only: ['tasks'],
          onSuccess: () => {
            setOptimisticLiked(null)
            setOptimisticCount(null)
          },
          onError: () => {
            setOptimisticLiked(null)
            setOptimisticCount(null)
          },
        }
      )
    },
    [isLiked, likesCount, likeableType, likeableId, stopPropagation]
  )

  return (
    <button
      onClick={handleClick}
      className={cn('flex items-center gap-1 group/like', className)}
      type="button"
    >
      <ThumbsUp
        className={cn(
          'cursor-pointer transition-colors shrink-0',
          iconSizes[size],
          isLiked
            ? 'text-primary fill-primary'
            : 'text-muted-foreground group-hover/like:text-primary'
        )}
      />
      {likesCount > 0 && (
        <span
          className={cn(
            'tabular-nums',
            textSizes[size],
            isLiked ? 'text-primary font-medium' : 'text-muted-foreground'
          )}
        >
          {likesCount}
        </span>
      )}
    </button>
  )
})
