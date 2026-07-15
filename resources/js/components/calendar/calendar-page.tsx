import { useMemo, useCallback, useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ChevronLeft, ChevronRight, Plus, CalendarDays, CalendarX,
  Users, Video, Building2, Globe, Pencil, Trash2, CircleCheck, Circle,
} from 'lucide-react'
import { EventModal, EventViewModal } from '@/components/modals/event-modal'
import AppAvatar from '@/components/app-avatar'
import { Event, PaginatedData, SharedData, User } from '@/types'
import {
  parseLaravelDate, toDateKey,
  EVENT_TYPE_STYLES,
  EVENT_TYPE_BADGE, EVENT_TYPE_ICON_COLOR, EVENT_TYPE_LABELS, EVENT_LOCATION_LABELS,
  type EventType,
} from '@/utils/app-utils'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = 'day' | 'week' | 'month'

type CalendarEvent = Pick<Event, 'id' | 'title' | 'type' | 'start_date' | 'completed_at'> & { date_key: string }

interface PageProps extends SharedData {
  calendarEvents: CalendarEvent[]      // lightweight grid dots
  tableEvents: PaginatedData<Event>    // paginated full data
  filters: { view: ViewMode; date: string }
  members: User[]
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']


function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fmtTime(dateStr: string) {
  return parseLaravelDate(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function fmtDuration(start: string, end: string) {
  const m = Math.round((parseLaravelDate(end).getTime() - parseLaravelDate(start).getTime()) / 60000)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem ? `${h}h ${rem}m` : `${h}h`
}

function isPastDate(dateOrStr: Date | string) {
  const d = typeof dateOrStr === 'string' ? parseLaravelDate(dateOrStr) : new Date(dateOrStr)
  d.setHours(0, 0, 0, 0)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return d < today
}

function LocationIcon({ location }: { location: string }) {
  return location === 'online'
    ? <Video className="w-3.5 h-3.5" />
    : location === 'office'
      ? <Building2 className="w-3.5 h-3.5" />
      : <Globe className="w-3.5 h-3.5" />
}

// ─── CalendarPage ─────────────────────────────────────────────────────────────

export function CalendarPage() {
  const { calendarEvents, tableEvents: paginatedEvents, filters } = usePage<PageProps>().props

  const [createOpen, setCreateOpen] = useState(false)
  const [createDate, setCreateDate] = useState<Date | undefined>()
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  // Derived from server filters (no local month/day state needed)
  const anchorDate = new Date(`${filters.date}T12:00:00`)
  const currentMonth = anchorDate.getMonth()
  const currentYear = anchorDate.getFullYear()
  const selectedDay = anchorDate.getDate()
  const viewMode = filters.view

  const calendarDays = useMemo(() => {
    const dim = new Date(currentYear, currentMonth + 1, 0).getDate()
    const fdom = new Date(currentYear, currentMonth, 1).getDay()
    return [
      ...Array<null>(fdom).fill(null),
      ...Array.from({ length: dim }, (_, i) => i + 1),
    ] as (number | null)[]
  }, [currentYear, currentMonth])

  const gridLookup = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    calendarEvents?.forEach((ev) => {
      const key = ev.date_key ?? toDateKey(ev.start_date)
      if (!map[key]) map[key] = []
      map[key].push(ev)
    })
    return map
  }, [calendarEvents])

  const getGridEvents = (day: number) => {
    const key = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return gridLookup[key] ?? []
  }


  const go = useCallback((params: Record<string, string | number>) => {
    router.get(route('calendar.index'), params as Record<string, string>, {
      preserveState: true,
      preserveScroll: true,
      only: ['calendarEvents', 'tableEvents', 'filters'],
    })
  }, [])

  const changeMonth = (dir: -1 | 1) => {
    const d = new Date(currentYear, currentMonth + dir, 1)
    go({ date: toDateStr(d), view: viewMode })
  }

  const goToToday = () => go({ date: toDateStr(new Date()), view: viewMode })

  const selectDay = (day: number) => {
    const d = new Date(currentYear, currentMonth, day)
    go({ date: toDateStr(d), view: 'day' })
  }

  const changeView = (v: ViewMode) =>
    go({ date: filters.date, view: v })

  const changePage = (page: number) =>
    go({ date: filters.date, view: viewMode, page })

  const openCreate = (day: number) => {
    const d = new Date(currentYear, currentMonth, day)
    if (isPastDate(d)) { toast.info('Cannot create events on past dates'); return }
    setCreateDate(d)
    setCreateOpen(true)
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

  const deleteEvent = (event: Event) => {
    if (!confirm(`Delete "${event.title}"? This cannot be undone.`)) return
    router.delete(route('events.destroy', event.id), {
      preserveScroll: true,
      onSuccess: () => { toast.success('Event deleted'); setViewingEvent(null) },
      onError: () => toast.error('Failed to delete event'),
    })
  }

  const tableLabel = (() => {
    if (viewMode === 'day') {
      return anchorDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    }
    if (viewMode === 'week') {
      const start = new Date(anchorDate)
      start.setDate(anchorDate.getDate() - anchorDate.getDay())
      const end = new Date(start); end.setDate(start.getDate() + 6)
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }
    return `${MONTH_NAMES[currentMonth]} ${currentYear}`
  })()

  const events = paginatedEvents.data ?? []
  const pg = {
    current: paginatedEvents.current_page ?? 1,
    last: paginatedEvents.last_page ?? 1,
    total: paginatedEvents.total ?? 0,
    from: paginatedEvents.from ?? 0,
    to: paginatedEvents.to ?? 0,
  }
  const isAnchorPast = isPastDate(filters.date)

  return (
    <div className="p-6 min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Schedule and manage meetings, deadlines, and events</p>
        </div>
        <EventModal open={createOpen} onOpenChange={setCreateOpen} selectedDate={createDate} />
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{MONTH_NAMES[currentMonth]} {currentYear}</CardTitle>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => changeMonth(-1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={goToToday}>Today</Button>
                  <Button variant="outline" size="sm" onClick={() => changeMonth(1)}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border dark:border-border">
                {DAY_NAMES.map(d => (
                  <div key={d} className="bg-muted/50 px-2 py-1.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                    {d}
                  </div>
                ))}

                {calendarDays.map((day, idx) => {
                  if (day === null) return <div key={`e-${idx}`} className="bg-card h-20" />

                  const now = new Date()
                  const isToday = day === now.getDate() && currentMonth === now.getMonth() && currentYear === now.getFullYear()
                  const isSelected = day === selectedDay
                  const isPast = isPastDate(new Date(currentYear, currentMonth, day))
                  const dayEvents = getGridEvents(day)

                  return (
                    <div
                      key={day}
                      onClick={() => selectDay(day)}
                      className={cn(
                        'rounded-lg bg-card h-20 p-1.5 flex flex-col gap-0.5 cursor-pointer transition-colors hover:bg-accent',
                        isSelected && 'bg-primary/10 ring-1 ring-inset ring-primary hover:bg-primary/10',
                        isPast && 'opacity-50',
                      )}
                    >
                      <span className={cn(
                        'text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full self-start',
                        isToday && 'bg-primary text-primary-foreground',
                        !isToday && 'text-foreground',
                      )}>
                        {day}
                      </span>

                      <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                        {dayEvents.length === 0 && !isPast ? (
                          <div
                            className="flex-1 flex items-center justify-center group "
                          >
                            <Plus
                              onClick={(e) => {
                                e.stopPropagation(); openCreate(day)
                              }}
                              className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                          </div>
                        ) : (
                          <>
                            {dayEvents.slice(0, 2).map(ev => (
                              <div key={ev.id} className={cn(
                                'text-[9px] leading-tight px-1 py-px rounded truncate border',
                                EVENT_TYPE_STYLES[ev.type as EventType],
                                ev.completed_at && 'line-through opacity-60',
                              )}>
                                {ev.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <span className="text-[9px] text-muted-foreground pl-1">+{dayEvents.length - 2} more</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <CalendarDays className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">{tableLabel}</p>
                <p className="text-xs text-muted-foreground">
                  {pg.total === 0
                    ? 'No events'
                    : `${pg.from}–${pg.to} of ${pg.total} event${pg.total !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(v) => changeView(v as ViewMode)}>
                <SelectTrigger className="h-8 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
              {!isAnchorPast && (
                <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => openCreate(selectedDay)}>
                  <Plus className="w-3.5 h-3.5" />
                  Add Event
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-0">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
              <div className="rounded-full bg-muted p-4">
                <CalendarX className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">No events</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isAnchorPast ? 'No events were scheduled.' : 'Select a day or click + to schedule something.'}
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs w-[40px]" />
                  {viewMode !== 'day' && <TableHead className="text-xs w-[100px]">Date</TableHead>}
                  <TableHead className="text-xs w-[90px]">Time</TableHead>
                  <TableHead className="text-xs">Title</TableHead>
                  <TableHead className="text-xs w-[100px]">Type</TableHead>
                  {viewMode !== 'day' && <TableHead className="text-xs w-[80px]">Duration</TableHead>}
                  <TableHead className="text-xs w-[110px]">Location</TableHead>
                  <TableHead className="text-xs w-[120px]">Attendees</TableHead>
                  <TableHead className="text-xs w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => {
                  const type = event.type as EventType
                  const attendees: User[] = Array.isArray(event.attendees) ? event.attendees : []
                  const isCompleted = !!event.completed_at
                  const eventPast = isPastDate(event.start_date)
                  return (
                    <TableRow key={event.id} className={cn('cursor-pointer hover:bg-muted/50', isCompleted && 'opacity-60')} onClick={() => setViewingEvent(event)}>
                      <TableCell className="pl-3 pr-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleComplete(event) }}
                          className="flex items-center justify-center"
                        >
                          {isCompleted
                            ? <CircleCheck className="w-4 h-4 text-emerald-500" />
                            : <Circle className="w-4 h-4 text-muted-foreground/40 hover:text-primary transition-colors" />
                          }
                        </button>
                      </TableCell>
                      {viewMode !== 'day' && (
                        <TableCell className="text-xs text-muted-foreground">
                          {parseLaravelDate(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </TableCell>
                      )}
                      <TableCell className="text-xs text-muted-foreground tabular-nums">{fmtTime(event.start_date)}</TableCell>
                      <TableCell>
                        <span className={cn('text-sm font-medium', isCompleted && 'line-through')}>{event.title}</span>
                        {event.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[220px] mt-0.5">{event.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn('text-[10px] border-0 font-medium', EVENT_TYPE_BADGE[type])}>
                          {EVENT_TYPE_LABELS[type]}
                        </Badge>
                      </TableCell>
                      {viewMode !== 'day' && (
                        <TableCell className="text-xs text-muted-foreground">
                          {event.end_date ? fmtDuration(event.start_date, event.end_date) : '—'}
                        </TableCell>
                      )}
                      <TableCell>
                        {event.location ? (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <LocationIcon location={event.location} />
                            <span>{EVENT_LOCATION_LABELS[event.location] ?? event.location}</span>
                          </div>
                        ) : <span className="text-xs text-muted-foreground/40">—</span>}
                      </TableCell>
                      <TableCell>
                        {attendees.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <div className="flex -space-x-1.5">
                              {attendees.slice(0, 3).map(a => (
                                <AppAvatar key={a.id} src={a.avatar} name={a.name} size="xs" className="ring-1 ring-background" />
                              ))}
                            </div>
                            {attendees.length > 3 && (
                              <span className="text-[10px] text-muted-foreground ml-1">+{attendees.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <Users className={cn('w-3.5 h-3.5 text-muted-foreground/30', EVENT_TYPE_ICON_COLOR[type])} />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!eventPast && (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0"
                              onClick={(e) => { e.stopPropagation(); setEditingEvent(event) }}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); deleteEvent(event) }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pg.last > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
              <span>Page {pg.current} of {pg.last}</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs"
                  disabled={pg.current <= 1} onClick={() => changePage(pg.current - 1)}>
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </Button>
                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs"
                  disabled={pg.current >= pg.last} onClick={() => changePage(pg.current + 1)}>
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {viewingEvent && (
        <EventViewModal
          event={viewingEvent}
          isPast={isPastDate(viewingEvent.start_date)}
          onClose={() => setViewingEvent(null)}
          onEdit={() => { setEditingEvent(viewingEvent); setViewingEvent(null) }}
          onDelete={() => deleteEvent(viewingEvent)}
          onToggleComplete={() => toggleComplete(viewingEvent)}
        />
      )}
      {editingEvent && (
        <EventModal
          event={editingEvent}
          open={!!editingEvent}
          onOpenChange={(open) => { if (!open) setEditingEvent(null) }}
        />
      )}
    </div>
  )
}
