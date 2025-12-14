import React from 'react'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Smile } from 'lucide-react'
import { useAppearance } from '@/hooks/use-appearance'

interface AppEmojiPickerProps {
  open: boolean
  setOpen: (open: boolean) => void
  insertEmoji: (emoji: string) => void
}

const AppEmojiPicker = ({ open, setOpen, insertEmoji }: AppEmojiPickerProps) => {
  const { appearance } = useAppearance()
  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-muted transition-colors"
        >
          <Smile className="h-5 w-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 border shadow-none w-fit z-[100]">
        <EmojiPicker
          onEmojiClick={(emojiData) => {
            insertEmoji(emojiData.emoji)
            setOpen(false)
          }}
          lazyLoadEmojis
          previewConfig={{ showPreview: false }}
          height={400}
          className='p-0.5'
          width={350}
          theme={appearance === 'dark' ? Theme.DARK : Theme.AUTO}
        />
      </PopoverContent>
    </Popover>
  )
}

export default AppEmojiPicker
