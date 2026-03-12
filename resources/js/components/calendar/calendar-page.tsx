/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  X,
  Clock,
  Plus,
} from 'lucide-react'
import AddNewEvent from '@/components/modals/add-new-event'
import { usePage } from '@inertiajs/react'
import { Event, SharedData } from '@/types'

interface CalendarEvent {
  id: string
  title: string
  time: string
  duration: string
  type: 'meeting' | 'deadline' | 'reminder' | 'call'
  location?: string
  attendees?: string[]
  description?: string
}

interface DayEvents {
  [key: string]: CalendarEvent[]
}

const EVENT_TYPE_STYLES: Record<CalendarEvent['type'], string> = {
  meeting: 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-800',
  deadline: 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100 border-red-300 dark:border-red-800',
  reminder: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100 border-yellow-300 dark:border-yellow-800',
  call: 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100 border-green-300 dark:border-green-800',
}

const EVENT_DOT_STYLES: Record<CalendarEvent['type'], string> = {
  meeting: 'bg-blue-500 dark:bg-blue-400',
  deadline: 'bg-red-500 dark:bg-red-400',
  reminder: 'bg-yellow-500 dark:bg-yellow-400',
  call: 'bg-green-500 dark:bg-green-400',
}

// Helper function to calculate duration between two dates
const calculateDuration = (start: string, end: string): string => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffMs = endDate.getTime() - startDate.getTime()
  const diffMins = Math.round(diffMs / 60000)

  if (diffMins < 60) {
    return `${diffMins} min`
  }
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`
}

export function CalendarPage() {
  const { events } = usePage<SharedData & { events: Event[] }>().props

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [eventDialogDate, setEventDialogDate] = useState<Date | undefined>(undefined)

  // Transform events into the calendar format
  const eventsMap = useMemo(() => {
    const map: DayEvents = {}

    events?.forEach((event) => {
      const startDate = new Date(event.start_date)
      const key = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`

      const calendarEvent: CalendarEvent = {
        id: event.id,
        title: event.title,
        time: startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        duration: event.end_date ? calculateDuration(event.start_date, event.end_date) : '',
        type: event.type,
        location: event.location || undefined,
        attendees: event.attendees && Array.isArray(event.attendees) && event.attendees.length > 0
          ? event.attendees.map(a => a.name)
          : undefined,
        description: event.description || undefined,
      }

      if (!map[key]) {
        map[key] = []
      }
      map[key].push(calendarEvent)
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

  const getEventsForDay = (day: number): CalendarEvent[] => {
    const key = `${currentYear}-${currentMonth + 1}-${day}`
    return eventsMap[key] ?? []
  }

  const openEventDialog = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    setEventDialogDate(date)
    setEventDialogOpen(true)
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
        {/* Calendar */}
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
                    const events = getEventsForDay(day)

                    return (
                      <div
                        key={day}
                        onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                        className={`p-2 h-24 border rounded-lg cursor-pointer transition-colors flex flex-col gap-1
                ${isSelected ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border hover:bg-accent"}
                ${isToday && !isSelected ? "bg-primary/5 border-primary/40" : ""}`}
                      >
                        <div className={`text-sm font-medium ${isToday ? "text-primary" : "text-foreground"}`}>
                          {day}
                        </div>

                        <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                          {events.length === 0 ? (
                            <div
                              className="flex-1 flex items-center justify-center group"
                              onClick={(e) => {
                                e.stopPropagation()
                                openEventDialog(day)
                              }}
                            >
                              <Plus className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:scale-110 transition-all" />
                            </div>
                          ) : (
                            <>
                              {events.slice(0, 2).map(event => (
                                <div
                                  key={event.id}
                                  className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate border ${EVENT_TYPE_STYLES[event.type]}`}
                                >
                                  {event.title}
                                </div>
                              ))}

                              {events.length > 2 && (
                                <div className="text-[10px] text-muted-foreground pl-1">
                                  +{events.length - 2} more
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

        {/* Events Section - Now at Bottom */}
        {selectedDay !== null ? (
          <Card className="border-primary/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{selectedDateLabel}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedEvents.length === 0
                      ? 'No events'
                      : `${selectedEvents.length} event${selectedEvents.length > 1 ? 's' : ''}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setSelectedDay(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="rounded-full bg-muted p-4">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      No events scheduled
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Create a new event for this day
                    </p>
                  </div>
                  <AddNewEvent
                    selectedDate={selectedDay ? new Date(currentYear, currentMonth, selectedDay) : undefined}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedEvents.map(event => (
                    <div
                      key={event.id}
                      className={`rounded-lg border p-3 space-y-2 ${EVENT_TYPE_STYLES[event.type]}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm leading-tight">{event.title}</p>
                        <Badge
                          variant="outline"
                          className={`capitalize text-[10px] shrink-0 ${EVENT_TYPE_STYLES[event.type]}`}
                        >
                          {event.type}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        {(event.time || event.duration) && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>
                              {event.time}
                              {event.duration && ` · ${event.duration}`}
                            </span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Users className="w-3 h-3 shrink-0" />
                              <span className="font-medium">Attendees:</span>
                            </div>
                            <div className="flex flex-wrap gap-1 pl-5">
                              {event.attendees.map((attendee, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-[10px] px-1.5 py-0.5"
                                >
                                  {attendee}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-xs opacity-80 leading-relaxed border-t border-current/10 pt-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Events</CardTitle>
              <p className="text-xs text-muted-foreground">Click a day to see its events</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {(['meeting', 'deadline', 'reminder', 'call'] as CalendarEvent['type'][]).map(type => (
                  <div key={type} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${EVENT_DOT_STYLES[type]}`} />
                    <span className="capitalize">{type}</span>
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
