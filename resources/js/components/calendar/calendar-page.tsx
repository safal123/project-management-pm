import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { EventModal, EventViewModal } from '@/components/modals/event-modal'
import { TaskDetailSheet } from '@/components/projects/task-detail-sheet'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Event, SharedData, Task } from '@/types'
import { EVENT_TYPE_STYLES, parseLaravelDate, toDateKey, type EventType } from '@/utils/app-utils'
import { cn } from '@/lib/utils'

type ViewMode = 'month' | 'week' | 'agenda'

type CalendarEvent = Pick<Event, 'id' | 'title' | 'type' | 'start_date' | 'completed_at'> & {
  date_key: string
  end_date?: string | null
  description?: string | null
  location?: string | null
  attendees?: Event['attendees']
}

type DueDateCard = {
  id: string
  title: string
  due_date: string
  date_key: string
  status?: string | null
  slug?: string
}

type CalendarItem = {
  id: string
  title: string
  kind: 'event' | 'card'
  dateKey: string
  start: Date
  end: Date | null
  event?: CalendarEvent
  card?: DueDateCard
}

interface PageProps extends SharedData {
  calendarEvents: CalendarEvent[]
  dueDateCards: DueDateCard[]
  filters: { view: ViewMode; date: string }
  tasks?: Task[] | { data?: Task[] }
}

function unwrapTasks(tasks?: Task[] | { data?: Task[] }) {
  if (!tasks) return []
  return Array.isArray(tasks) ? tasks : (tasks.data ?? [])
}

const HOUR_HEIGHT = 48
const HOURS = Array.from({ length: 24 }, (_, hour) => hour)
const WEEK_STARTS_ON = 1 as const

function toDateStr(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function parseDate(value?: string) {
  if (!value) return new Date()
  return new Date(`${value}T12:00:00`)
}

function weekDays(anchor: Date) {
  const start = startOfWeek(anchor, { weekStartsOn: WEEK_STARTS_ON })
  return eachDayOfInterval({ start, end: endOfWeek(anchor, { weekStartsOn: WEEK_STARTS_ON }) })
}

function monthDays(anchor: Date) {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: WEEK_STARTS_ON })
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: WEEK_STARTS_ON })
  return eachDayOfInterval({ start, end })
}

function formatHour(hour: number) {
  if (hour === 0) return '12 AM'
  if (hour === 12) return '12 PM'
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
}

function isTimed(date: Date) {
  return date.getHours() !== 0 || date.getMinutes() !== 0
}

function minutesFromMidnight(date: Date) {
  return date.getHours() * 60 + date.getMinutes()
}

function headerLabel(view: ViewMode, anchor: Date) {
  if (view === 'week') {
    const days = weekDays(anchor)
    return `${format(days[0], 'd')} – ${format(days[6], 'd MMMM yyyy')}`
  }

  return format(anchor, 'MMMM yyyy')
}

export function CalendarPage() {
  const {
    calendarEvents = [],
    dueDateCards = [],
    filters = { view: 'week' as ViewMode, date: toDateStr(new Date()) },
    project,
    tasks,
  } = usePage<PageProps & { project?: { slug: string } }>().props

  const [showEvents, setShowEvents] = useState(true)
  const [showCards, setShowCards] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [createDate, setCreateDate] = useState<Date | undefined>()
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const selectedTask = unwrapTasks(tasks).find((task) => task.id === selectedTaskId) ?? null

  const viewMode: ViewMode = filters.view === 'month' || filters.view === 'agenda' ? filters.view : 'week'
  const anchorDate = parseDate(filters.date)
  const visibleWeek = useMemo(() => weekDays(anchorDate), [anchorDate])

  const items = useMemo<CalendarItem[]>(() => {
    const eventItems = showEvents
      ? calendarEvents.map((event) => ({
          id: `event-${event.id}`,
          title: event.title,
          kind: 'event' as const,
          dateKey: event.date_key ?? toDateKey(event.start_date),
          start: parseLaravelDate(event.start_date),
          end: event.end_date ? parseLaravelDate(event.end_date) : null,
          event,
        }))
      : []

    const cardItems = showCards
      ? dueDateCards.map((card) => ({
          id: `card-${card.id}`,
          title: card.title,
          kind: 'card' as const,
          dateKey: card.date_key ?? toDateKey(card.due_date),
          start: parseLaravelDate(card.due_date),
          end: null,
          card,
        }))
      : []

    return [...eventItems, ...cardItems]
  }, [calendarEvents, dueDateCards, showEvents, showCards])

  const itemsByDay = useMemo(() => {
    const map: Record<string, CalendarItem[]> = {}
    items.forEach((item) => {
      if (!map[item.dateKey]) map[item.dateKey] = []
      map[item.dateKey].push(item)
    })
    return map
  }, [items])

  const go = useCallback((params: Record<string, string | number>) => {
    if (!project?.slug) return

    router.get(
      route('projects.show', { project: project.slug }),
      { ...params, tab: 'calendar' } as Record<string, string>,
      {
        preserveState: true,
        preserveScroll: true,
        only: ['calendarEvents', 'tableEvents', 'dueDateCards', 'filters', 'members', 'tasks'],
      }
    )
  }, [project?.slug])

  const changeView = (view: ViewMode) => go({ date: filters.date, view })
  const goToToday = () => go({ date: toDateStr(new Date()), view: viewMode })
  const goToDate = (date: Date) => go({ date: toDateStr(date), view: viewMode })

  const shift = (direction: -1 | 1) => {
    const next = viewMode === 'week' ? addWeeks(anchorDate, direction) : addMonths(anchorDate, direction)
    goToDate(next)
  }

  const openCreate = (date = new Date()) => {
    const next = new Date(date)
    next.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (next < today) {
      toast.info('Cannot create events on past dates')
      return
    }
    setCreateDate(date)
    setCreateOpen(true)
  }

  const openItem = (item: CalendarItem) => {
    if (item.kind === 'event' && item.event) {
      setViewingEvent(item.event as unknown as Event)
      return
    }

    if (item.card) {
      setSelectedTaskId(item.card.id)
    }
  }

  const deleteEvent = (event: Event) => {
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return
    router.delete(route('events.destroy', event.id), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Event deleted')
        setViewingEvent(null)
      },
      onError: () => toast.error('Failed to delete event'),
    })
  }

  const toggleComplete = (event: Event) => {
    router.post(route('events.toggle-complete', event.id), {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(event.completed_at ? 'Marked as incomplete' : 'Marked as completed')
        setViewingEvent(null)
      },
      onError: () => toast.error('Failed to update event'),
    })
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.closest('input, textarea, [contenteditable="true"]')) return

      if (event.key === 't' || event.key === 'T') goToToday()
      if (event.key === 'ArrowLeft') shift(-1)
      if (event.key === 'ArrowRight') shift(1)
      if (event.key === 'm' || event.key === 'M') changeView('month')
      if (event.key === 'w' || event.key === 'W') changeView('week')
      if (event.key === 'a' || event.key === 'A') changeView('agenda')
      if (event.key === 'c' || event.key === 'C') openCreate(anchorDate)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [anchorDate, filters.date, viewMode, project?.slug])

  return (
    <div className="m-3 flex h-[calc(100vh-164px)] min-h-0 flex-col overflow-hidden rounded-md border border-border bg-muted/30">
      <header className="flex h-11 shrink-0 items-center justify-between gap-3 border-b bg-muted/40 px-3">
        <div className="flex min-w-0 items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 px-2.5 text-[13px]" onClick={goToToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => shift(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => shift(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <p className="truncate pl-1 text-[13px] font-medium">{headerLabel(viewMode, anchorDate)}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="h-8 px-2.5 text-[13px]" onClick={() => openCreate(anchorDate)}>
            <Plus className="h-3.5 w-3.5" />
            New event
          </Button>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) => {
              if (value) changeView(value as ViewMode)
            }}
            variant="outline"
            size="sm"
            className="hidden sm:flex"
          >
            <ToggleGroupItem value="month" className="h-8 px-2.5 text-[13px]">Month</ToggleGroupItem>
            <ToggleGroupItem value="week" className="h-8 px-2.5 text-[13px]">Week</ToggleGroupItem>
            <ToggleGroupItem value="agenda" className="h-8 px-2.5 text-[13px]">Agenda</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto border-r px-3 py-3 lg:flex">
          <div className="rounded-md border border-border p-3">
            <Calendar
              mode="single"
              selected={anchorDate}
              month={anchorDate}
              onMonthChange={goToDate}
              onSelect={(date) => date && goToDate(date)}
              weekStartsOn={WEEK_STARTS_ON}
              className="w-full bg-transparent p-0"
            />
          </div>

          <section className="mt-6 space-y-2">
            <h3 className="text-[11px] font-medium text-muted-foreground">On this calendar</h3>
            <label className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1.5 hover:bg-muted/60">
              <Checkbox checked={showEvents} onCheckedChange={(checked) => setShowEvents(Boolean(checked))} className="mt-0.5" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2 text-[13px]">
                  Events
                  <span className="text-muted-foreground">{calendarEvents.length}</span>
                </span>
                <span className="block text-[11px] text-muted-foreground">Meetings and milestones</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1.5 hover:bg-muted/60">
              <Checkbox checked={showCards} onCheckedChange={(checked) => setShowCards(Boolean(checked))} className="mt-0.5" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2 text-[13px]">
                  Card due dates
                  <span className="text-muted-foreground">{dueDateCards.length}</span>
                </span>
                <span className="block text-[11px] text-muted-foreground">Cards with a due date</span>
              </span>
            </label>
          </section>

          <section className="mt-6 space-y-2">
            <h3 className="text-[11px] font-medium text-muted-foreground">Sync</h3>
            <div className="flex items-center gap-2 rounded-md border px-2.5 py-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">G</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] leading-tight">Google Calendar</span>
                <span className="block text-[11px] text-muted-foreground">Read-only import</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[12px]"
                onClick={() => toast.info('Google Calendar sync is coming soon')}
              >
                Connect
              </Button>
            </div>
            <div className="flex items-center gap-2 rounded-md border px-2.5 py-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[11px] font-semibold text-background">
                O
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] leading-tight">Microsoft 365</span>
                <span className="block text-[11px] text-muted-foreground">Coming soon</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[12px]"
                onClick={() => toast.info('Microsoft Calendar sync is coming soon')}
              >
                Connect
              </Button>
            </div>
          </section>

          <section className="mt-6 space-y-2">
            <h3 className="text-[11px] font-medium text-muted-foreground">Shortcuts</h3>
            <div className="space-y-1.5 text-[11px] text-muted-foreground">
              <Shortcut keys="T" label="Go to today" />
              <Shortcut keys="← →" label="Previous / next" />
              <Shortcut keys="M W A" label="Month, week, agenda" />
              <Shortcut keys="C" label="New event" />
            </div>
          </section>
        </aside>

        <div className="min-w-0 flex-1 overflow-hidden bg-background/70">
          {viewMode === 'week' && (
            <WeekView
              days={visibleWeek}
              itemsByDay={itemsByDay}
              onSelectSlot={openCreate}
              onOpenItem={openItem}
            />
          )}
          {viewMode === 'month' && (
            <MonthView
              anchorDate={anchorDate}
              itemsByDay={itemsByDay}
              onSelectDay={goToDate}
              onOpenItem={openItem}
            />
          )}
          {viewMode === 'agenda' && (
            <AgendaView
              days={monthDays(anchorDate).filter((day) => isSameMonth(day, anchorDate))}
              itemsByDay={itemsByDay}
              onOpenItem={openItem}
            />
          )}
        </div>
      </div>

      <EventModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        selectedDate={createDate}
        showTrigger={false}
      />
      {viewingEvent && (
        <EventViewModal
          event={viewingEvent}
          isPast={parseLaravelDate(viewingEvent.start_date) < new Date(new Date().setHours(0, 0, 0, 0))}
          onClose={() => setViewingEvent(null)}
          onEdit={() => {
            setEditingEvent(viewingEvent)
            setViewingEvent(null)
          }}
          onDelete={() => deleteEvent(viewingEvent)}
          onToggleComplete={() => toggleComplete(viewingEvent)}
        />
      )}
      {editingEvent && (
        <EventModal
          event={editingEvent}
          open={!!editingEvent}
          onOpenChange={(open) => {
            if (!open) setEditingEvent(null)
          }}
        />
      )}
      <TaskDetailSheet
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => {
          if (!open) setSelectedTaskId(null)
        }}
      />
    </div>
  )
}

function Shortcut({ keys, label }: { keys: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">{keys}</kbd>
    </div>
  )
}

function CalendarChip({ item, onClick }: { item: CalendarItem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={cn(
        'w-full truncate rounded border px-1.5 py-0.5 text-left text-[11px] leading-tight',
        item.kind === 'event'
          ? EVENT_TYPE_STYLES[(item.event?.type ?? 'meeting') as EventType]
          : 'border-border bg-muted text-foreground'
      )}
    >
      {item.title}
    </button>
  )
}

function WeekView({
  days,
  itemsByDay,
  onSelectSlot,
  onOpenItem,
}: {
  days: Date[]
  itemsByDay: Record<string, CalendarItem[]>
  onSelectSlot: (date: Date) => void
  onOpenItem: (item: CalendarItem) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const now = new Date()
  const showNow = days.some((day) => isToday(day))
  const nowTop = (minutesFromMidnight(now) / 60) * HOUR_HEIGHT

  useEffect(() => {
    const hour = Math.max(now.getHours() - 1, 8)
    if (scrollRef.current) {
      scrollRef.current.scrollTop = hour * HOUR_HEIGHT
    }
  }, [days[0]?.toISOString()])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid shrink-0 grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b">
        <div />
        {days.map((day) => (
          <div key={day.toISOString()} className="px-2 py-2 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {format(day, 'EEEE')}
            </p>
            <span
              className={cn(
                'mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-medium',
                isToday(day) && 'bg-foreground text-background'
              )}
            >
              {format(day, 'd')}
            </span>
          </div>
        ))}
      </div>

      <div className="grid shrink-0 grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b">
        <div className="px-2 py-2 text-[10px] uppercase tracking-wide text-muted-foreground">All day</div>
        {days.map((day) => {
          const key = toDateStr(day)
          const allDayItems = (itemsByDay[key] ?? []).filter((item) => item.kind === 'card' || !isTimed(item.start))
          return (
            <div
              key={key}
              className={cn('min-h-10 space-y-1 border-l px-1 py-1', isToday(day) && 'bg-muted/40')}
              onClick={() => onSelectSlot(day)}
            >
              {allDayItems.map((item) => (
                <CalendarChip key={item.id} item={item} onClick={() => onOpenItem(item)} />
              ))}
            </div>
          )
        })}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
        <div className="relative grid grid-cols-[56px_repeat(7,minmax(0,1fr))]">
          <div>
            {HOURS.map((hour) => (
              <div key={hour} className="relative h-12 border-b">
                <span className="absolute -top-2 right-2 text-[10px] text-muted-foreground">{formatHour(hour)}</span>
              </div>
            ))}
          </div>

          {days.map((day) => {
            const key = toDateStr(day)
            const timedItems = (itemsByDay[key] ?? []).filter((item) => item.kind === 'event' && isTimed(item.start))
            return (
              <div
                key={key}
                className={cn('relative border-l', isToday(day) && 'bg-muted/40')}
                onClick={() => onSelectSlot(day)}
              >
                {HOURS.map((hour) => (
                  <div key={hour} className="h-12 border-b" />
                ))}
                {timedItems.map((item) => {
                  const startMinutes = minutesFromMidnight(item.start)
                  const endMinutes = item.end ? minutesFromMidnight(item.end) : startMinutes + 60
                  const duration = Math.max(endMinutes - startMinutes, 30)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        onOpenItem(item)
                      }}
                      style={{
                        top: (startMinutes / 60) * HOUR_HEIGHT,
                        height: (duration / 60) * HOUR_HEIGHT,
                      }}
                      className={cn(
                        'absolute inset-x-1 overflow-hidden rounded border px-1.5 py-1 text-left text-[11px] leading-tight',
                        EVENT_TYPE_STYLES[(item.event?.type ?? 'meeting') as EventType]
                      )}
                    >
                      <span className="block truncate font-medium">{item.title}</span>
                      <span className="block text-[10px] opacity-70">{format(item.start, 'h:mm a')}</span>
                    </button>
                  )
                })}
              </div>
            )
          })}

          {showNow && (
            <div
              className="pointer-events-none absolute right-0 left-14 z-10"
              style={{ top: nowTop }}
            >
              <div className="relative border-t border-red-500">
                <span className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full bg-red-500" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MonthView({
  anchorDate,
  itemsByDay,
  onSelectDay,
  onOpenItem,
}: {
  anchorDate: Date
  itemsByDay: Record<string, CalendarItem[]>
  onSelectDay: (date: Date) => void
  onOpenItem: (item: CalendarItem) => void
}) {
  const days = monthDays(anchorDate)
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="grid shrink-0 grid-cols-7 border-b">
        {labels.map((label) => (
          <div key={label} className="px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6">
        {days.map((day) => {
          const key = toDateStr(day)
          const dayItems = itemsByDay[key] ?? []
          return (
            <div
              key={key}
              className={cn(
                'min-h-0 cursor-pointer overflow-hidden border-b border-r p-1.5',
                !isSameMonth(day, anchorDate) && 'bg-muted/20 text-muted-foreground',
                isToday(day) && 'bg-muted/40'
              )}
              onClick={() => onSelectDay(day)}
            >
              <span
                className={cn(
                  'mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px]',
                  isToday(day) && 'bg-foreground text-background'
                )}
              >
                {format(day, 'd')}
              </span>
              <div className="space-y-1">
                {dayItems.slice(0, 3).map((item) => (
                  <CalendarChip key={item.id} item={item} onClick={() => onOpenItem(item)} />
                ))}
                {dayItems.length > 3 && (
                  <p className="px-1 text-[10px] text-muted-foreground">+{dayItems.length - 3} more</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AgendaView({
  days,
  itemsByDay,
  onOpenItem,
}: {
  days: Date[]
  itemsByDay: Record<string, CalendarItem[]>
  onOpenItem: (item: CalendarItem) => void
}) {
  const rows = days
    .map((day) => ({ day, items: itemsByDay[toDateStr(day)] ?? [] }))
    .filter((row) => row.items.length > 0)

  if (rows.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <CalendarDays className="h-7 w-7 text-muted-foreground" />
        <p className="text-[13px] font-medium">No events or due dates</p>
        <p className="text-xs text-muted-foreground">Create an event or add a due date to a card.</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      {rows.map(({ day, items }) => (
        <div key={day.toISOString()} className="grid grid-cols-[88px_1fr] border-b">
          <div className="px-3 py-3">
            <p className="text-[11px] uppercase text-muted-foreground">{format(day, 'EEE')}</p>
            <p className={cn('text-lg font-medium', isToday(day) && 'text-foreground')}>{format(day, 'd')}</p>
          </div>
          <div className="space-y-1.5 py-3 pr-4">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onOpenItem(item)}
                className={cn(
                  'flex w-full items-center justify-between rounded-md border px-2.5 py-2 text-left text-[13px]',
                  item.kind === 'event'
                    ? EVENT_TYPE_STYLES[(item.event?.type ?? 'meeting') as EventType]
                    : 'bg-muted'
                )}
              >
                <span className="truncate">{item.title}</span>
                <span className="ml-3 shrink-0 text-[11px] text-muted-foreground">
                  {item.kind === 'card' ? 'Due' : format(item.start, 'h:mm a')}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
