import { useState } from 'react'
import { addDays, startOfDay } from 'date-fns'
import { router } from '@inertiajs/react'
import { Calendar, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar as DatePicker } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Task } from '@/types'
import { getDueDateDisplay, toDateKey } from '@/utils/app-utils'
import { FIELD_TRIGGER } from './field-styles'

interface TaskDueDateProps {
  task: Task
  variant?: 'field' | 'compact'
}

function toDateValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function selectedDate(value: string | null) {
  if (!value) return undefined
  return new Date(`${toDateKey(value)}T12:00:00`)
}

const QUICK_OPTIONS = [
  { label: 'Today', getDate: () => startOfDay(new Date()) },
  { label: 'Tomorrow', getDate: () => addDays(startOfDay(new Date()), 1) },
  { label: 'Next week', getDate: () => addDays(startOfDay(new Date()), 7) },
]

export default function TaskDueDate({ task, variant = 'compact' }: TaskDueDateProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [open, setOpen] = useState(false)
  const display = getDueDateDisplay(task.due_date)

  const saveDate = (date: Date | null) => {
    setIsUpdating(true)
    router.patch(
      route('tasks.update', { task: task.id }),
      { due_date: date ? toDateValue(date) : null },
      {
        preserveScroll: true,
        only: ['tasks', 'paginatedTasks'],
        onFinish: () => setIsUpdating(false),
      }
    )
    setOpen(false)
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isUpdating}
          onClick={(event) => event.stopPropagation()}
          className={
            variant === 'field'
              ? FIELD_TRIGGER
              : 'h-6 w-fit max-w-[120px] gap-1 rounded-md border px-2 text-[11px]'
          }
        >
          {isUpdating ? (
            <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
          <span className="min-w-0 truncate">
            {display?.text ?? 'Due date'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="z-[9999] w-[252px] p-0"
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="border-b p-1.5">
          {QUICK_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              className="flex h-8 w-full items-center rounded-md px-2 text-left text-[13px] hover:bg-muted"
              onClick={() => saveDate(option.getDate())}
            >
              {option.label}
            </button>
          ))}
        </div>

        <DatePicker
          mode="single"
          selected={selectedDate(task.due_date)}
          defaultMonth={selectedDate(task.due_date) ?? new Date()}
          onSelect={(date) => date && saveDate(date)}
          className="w-[252px] p-2 [--cell-size:1.75rem]"
        />

        {task.due_date && (
          <div className="border-t p-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start px-2 text-[13px] text-muted-foreground"
              onClick={() => saveDate(null)}
            >
              <X className="h-3.5 w-3.5" />
              Clear due date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
