/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useMemo } from 'react'
import { router, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ChevronLeft,
  ChevronRight,
  Users,
  X,
  Clock,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  Video,
  Building2,
  Globe,
} from 'lucide-react'
import AddNewEvent from '@/components/modals/add-new-event'
import AppAvatar from '@/components/app-avatar'
import { Event, SharedData, User } from '@/types'
import {
  EVENT_TYPE_STYLES,
  EVENT_DOT_STYLES,
  EVENT_CARD_ACCENT,
  EVENT_TYPE_BADGE,
  EVENT_TYPE_ICON_COLOR,
  EVENT_TYPE_LABELS,
  EVENT_LOCATION_LABELS,
  type EventType,
} from '@/utils/event-colors'
import { toast } from 'sonner'

const calculateDuration = (start: string, end: string): string => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffMs = endDate.getTime() - startDate.getTime()
  const diffMins = Math.round(diffMs / 60000)

  if (diffMins < 60) {
    return `${diffMins}m`
  }
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

const formatEventTime = (dateStr: string): string => {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const LocationIcon = ({ location }: { location: string }) => {
  switch (location) {
    case 'online':
      return <Video className="w-3.5 h-3.5 shrink-0" />
    case 'office':
      return <Building2 className="w-3.5 h-3.5 shrink-0" />
    default:
      return <Globe className="w-3.5 h-3.5 shrink-0" />
  }
}

export function CalendarPage() {
  const { events } = usePage<SharedData & { events: Event[] }>().props

  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [eventDialogDate, setEventDialogDate] = useState<Date | undefined>(undefined)
  const [editingEvent, setEditingEvent] = useState<Event | undefined>(undefined)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const eventsLookup = useMemo(() => {
    const map: Record<string, Event[]> = {}
    events?.forEach((event) => {
      const d = new Date(event.start_date)
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
      if (!map[key]) map[key] = []
      map[key].push(event)
    })
    return map
  }, [events])

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const calendarDays: (number | null)[] = []
  for (let i = 0;i < firstDayOfMonth;i++) calendarDays.push(null)
  for (let day = 1;day <= daysInMonth;day++) calendarDays.push(day)

  const navigateMonth = (direction: -1 | 1) => {
    const newMonth = currentMonth + direction
    if (newMonth < 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else if (newMonth > 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(newMonth)
    }
    setSelectedDay(null)
  }

  const goToToday = () => {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
    setSelectedDay(today.getDate())
  }

  const getEventsForDay = (day: number): Event[] => {
    const key = `${currentYear}-${currentMonth + 1}-${day}`
    return eventsLookup[key] ?? []
  }

  const openCreateDialog = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    setEventDialogDate(date)
    setEventDialogOpen(true)
  }

  const openEditDialog = (event: Event) => {
    setEditingEvent(event)
    setEditDialogOpen(true)
  }

  const handleDeleteEvent = (event: Event) => {
    if (!confirm(`Delete "${event.title}"? This action cannot be undone.`)) return
    router.delete(route('events.destroy', event.id), {
      preserveScroll: true,
      onSuccess: () => toast.success('Event deleted'),
      onError: () => toast.error('Failed to delete event'),
    })
  }

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : []

  const selectedDateLabel = selectedDay
    ? new Date(currentYear, currentMonth, selectedDay).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
    : null

  return (
    <div className="p-6 bg-white dark:bg-background min-h-screen">
      <div className="flex flex-col lg:flex-row md:justify-between mb-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground mb-0 md:mb-2">Calendar</h1>
          <Badge className="hidden lg:block">
            Schedule and manage meetings, deadlines, and events
          </Badge>
        </div>
        <AddNewEvent
          open={eventDialogOpen}
          onOpenChange={setEventDialogOpen}
          selectedDate={eventDialogDate}
        />
      </div>
      <div className="space-y-6">
        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {monthNames[currentMonth]} {currentYear}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button size="sm" onClick={goToToday}>
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {dayNames.map(day => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-medium text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} className="p-2 h-24" />
                    }

                    const isToday =
                      day === today.getDate() &&
                      currentMonth === today.getMonth() &&
                      currentYear === today.getFullYear()

                    const isSelected = day === selectedDay
                    const dayEvents = getEventsForDay(day)

                    return (
                      <div
                        key={day}
                        onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                        className={`p-2 h-24 border rounded-lg cursor-pointer transition-colors flex flex-col gap-1
                          ${isSelected ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border hover:bg-accent'}
                          ${isToday && !isSelected ? 'bg-primary/5 border-primary/40' : ''}`}
                      >
                        <div className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                          {day}
                        </div>

                        <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                          {dayEvents.length === 0 ? (
                            <div
                              className="flex-1 flex items-center justify-center group"
                              onClick={(e) => {
                                e.stopPropagation()
                                openCreateDialog(day)
                              }}
                            >
                              <Plus className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:scale-110 transition-all" />
                            </div>
                          ) : (
                            <>
                              {dayEvents.slice(0, 2).map(event => (
                                <div
                                  key={event.id}
                                  className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate border ${EVENT_TYPE_STYLES[event.type]}`}
                                >
                                  {event.title}
                                </div>
                              ))}

                              {dayEvents.length > 2 && (
                                <div className="text-[10px] text-muted-foreground pl-1">
                                  +{dayEvents.length - 2} more
                                </div>
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

        {/* Event Details Section */}
        {selectedDay !== null ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{selectedDateLabel}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {selectedEvents.length === 0
                        ? 'No events scheduled'
                        : `${selectedEvents.length} event${selectedEvents.length > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => openCreateDialog(selectedDay)}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Event
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setSelectedDay(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-4">
              {selectedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="rounded-full bg-muted p-4">
                    <CalendarDays className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Nothing on the agenda
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Click "Add Event" to schedule something for this day.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {selectedEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={() => openEditDialog(event)}
                      onDelete={() => handleDeleteEvent(event)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Events</CardTitle>
                  <p className="text-xs text-muted-foreground">Select a day to view and manage events</p>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-4">
                {(['meeting', 'deadline', 'reminder', 'call'] as EventType[]).map(type => (
                  <div key={type} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${EVENT_DOT_STYLES[type]}`} />
                    <span>{EVENT_TYPE_LABELS[type]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function EventCard({
  event,
  onEdit,
  onDelete,
}: {
  event: Event
  onEdit: () => void
  onDelete: () => void
}) {
  const time = formatEventTime(event.start_date)
  const duration = event.end_date ? calculateDuration(event.start_date, event.end_date) : null
  const type = event.type as EventType
  const attendees = event.attendees && Array.isArray(event.attendees) ? event.attendees : []

  return (
    <div
      className={`group relative rounded-lg border border-l-4 bg-card hover:shadow-md transition-shadow ${EVENT_CARD_ACCENT[type]}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground truncate">{event.title}</h4>
          <Badge
            variant="secondary"
            className={`mt-1 text-[10px] font-medium px-1.5 py-0 border-0 ${EVENT_TYPE_BADGE[type]}`}
          >
            {EVENT_TYPE_LABELS[type]}
          </Badge>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onEdit}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Meta */}
      <div className="px-4 pb-3 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className={`w-3.5 h-3.5 shrink-0 ${EVENT_TYPE_ICON_COLOR[type]}`} />
          <span>
            {time}
            {duration && (
              <span className="ml-1 text-muted-foreground/70">({duration})</span>
            )}
          </span>
        </div>

        {event.location && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LocationIcon location={event.location} />
            <span>{EVENT_LOCATION_LABELS[event.location] ?? event.location}</span>
          </div>
        )}

        {attendees.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className={`w-3.5 h-3.5 shrink-0 ${EVENT_TYPE_ICON_COLOR[type]}`} />
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1.5">
                {attendees.slice(0, 4).map((attendee: User) => (
                  <AppAvatar
                    key={attendee.id}
                    src={attendee.avatar}
                    name={attendee.name}
                    size="xs"
                    className="ring-2 ring-card"
                  />
                ))}
              </div>
              {attendees.length > 4 && (
                <span className="text-[10px] text-muted-foreground">
                  +{attendees.length - 4}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <>
          <Separator />
          <p className="px-4 py-2.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {event.description}
          </p>
        </>
      )}
    </div>
  )
}
