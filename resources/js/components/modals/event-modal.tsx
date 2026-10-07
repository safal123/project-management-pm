import { useState, useEffect } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import { Event, SharedData, User } from '@/types'
import { BaseModal } from './base-modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import InputError from '@/components/input-error'
import AppAvatar from '@/components/app-avatar'
import ActivityFeed from '@/components/activity-feed'
import {
  Plus, CalendarPlus, CalendarDays, Pencil, ChevronDownIcon,
  Loader2, AlertCircle, Clock, Users, Video, Building2, Globe, Trash2,
  CircleCheck, Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'
import type { FormEventHandler } from 'react'
import {
  parseLaravelDate,
  EVENT_TYPE_ICON_COLOR,
  EVENT_TYPE_LABELS,
  EVENT_LOCATION_LABELS,
  type EventType,
} from '@/utils/app-utils'

// ─── Shared helpers ───────────────────────────────────────────────────────────

function extractTime(dateStr: string | Date | undefined): string {
  if (!dateStr) return '09:00'
  const d = typeof dateStr === 'string' ? parseLaravelDate(dateStr) : dateStr
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function formatEventTime(dateStr: string) {
  return parseLaravelDate(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function calculateDuration(start: string, end: string) {
  const diffMins = Math.round((parseLaravelDate(end).getTime() - parseLaravelDate(start).getTime()) / 60000)
  if (diffMins < 60) return `${diffMins}m`
  const h = Math.floor(diffMins / 60)
  const m = diffMins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function LocationIcon({ location }: { location: string }) {
  return location === 'online'
    ? <Video className="w-3.5 h-3.5 shrink-0" />
    : location === 'office'
      ? <Building2 className="w-3.5 h-3.5 shrink-0" />
      : <Globe className="w-3.5 h-3.5 shrink-0" />
}

const TIME_OPTIONS: string[] = Array.from({ length: 24 * 4 }, (_, i) => {
  const h = Math.floor(i / 4).toString().padStart(2, '0')
  const m = ((i % 4) * 15).toString().padStart(2, '0')
  return `${h}:${m}`
})

// ─── EventModal (create / edit) ───────────────────────────────────────────────

interface EventModalProps {
  event?: Event
  selectedDate?: Date
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EventModal({ event, selectedDate, open: controlledOpen, onOpenChange }: EventModalProps) {
  const { members } = usePage<SharedData & { members: User[] }>().props
  const [internalOpen, setInternalOpen] = useState(false)
  const [hasEndDate, setHasEndDate] = useState(false)
  const [hasAttendees, setHasAttendees] = useState(false)

  const isEditMode = !!event
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen

  const getInitialValues = () => ({
    title: event?.title || '',
    description: event?.description || '',
    type: event?.type || 'meeting',
    location: event?.location || 'office',
    start_date: event?.start_date ? parseLaravelDate(event.start_date) : (selectedDate ?? new Date()),
    start_time: event?.start_date ? extractTime(event.start_date) : '09:00',
    end_date: event?.end_date ? parseLaravelDate(event.end_date) : new Date(),
    end_time: event?.end_date ? extractTime(event.end_date) : '10:00',
    attendees: event?.attendees?.map((a) => a.id) ?? [],
  })

  const { data, setData, processing, errors, reset, post, put, transform } = useForm(getInitialValues())

  useEffect(() => {
    if (open && event) {
      setHasEndDate(!!event.end_date)
      setHasAttendees(!!(event.attendees && event.attendees.length > 0))
      const vals = getInitialValues()
      Object.entries(vals).forEach(([key, val]) => {
        setData(key as keyof typeof vals, val as never)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event?.id])

  useEffect(() => {
    if (open && selectedDate && !isEditMode) {
      setData('start_date', selectedDate)
      if (hasEndDate) setData('end_date', selectedDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, open])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && selectedDate && !isEditMode) setData('start_date', selectedDate)
    if (!isOpen && !isEditMode) { reset(); setHasEndDate(false); setHasAttendees(false) }
  }

  const submit: FormEventHandler = (e) => {
    e.preventDefault()
    transform((d) => ({
      title: d.title,
      description: d.description,
      type: d.type,
      location: d.location,
      start_date: format(d.start_date as Date, 'yyyy-MM-dd'),
      start_time: d.start_time,
      ...(hasAttendees && { attendees: d.attendees }),
      ...(hasEndDate && {
        end_date: format(d.end_date as Date, 'yyyy-MM-dd'),
        end_time: d.end_time,
      }),
    }))

    if (isEditMode) {
      put(route('events.update', event.id), {
        onSuccess: () => { toast.success('Event updated'); setOpen(false) },
        onError: () => toast.error('Failed to update event'),
      })
    } else {
      post(route('events.store'), {
        onSuccess: () => { toast.success('Event created'); reset(); setOpen(false) },
        onError: () => toast.error('Failed to create event'),
      })
    }
  }

  const dateDisabled = (date: Date) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const max = new Date(); max.setFullYear(max.getFullYear() + 1)
    return date < today || date > max
  }

  return (
    <BaseModal
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        !isEditMode ? (
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        ) : undefined
      }
      icon={
        isEditMode
          ? <Pencil className="h-5 w-5 text-primary" />
          : <CalendarPlus className="h-5 w-5 text-primary" />
      }
      title={isEditMode ? 'Edit Event' : 'Create New Event'}
      description={isEditMode ? 'Update your event details below.' : 'Add a new event to your calendar.'}
      className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
      formProps={{ onSubmit: submit }}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={processing} className="gap-2">
            {processing ? (
              <><Loader2 className="h-4 w-4 animate-spin" />{isEditMode ? 'Updating…' : 'Creating…'}</>
            ) : (
              <>{isEditMode ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{isEditMode ? 'Update Event' : 'Create Event'}</>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {Object.keys(errors).length > 0 && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Please fix the errors below.</p>
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Event Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
            placeholder="e.g., Team Meeting, Project Review"
            className="h-10"
          />
          <InputError message={errors.title} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            placeholder="Add event details…"
            className="resize-none"
            rows={3}
          />
          <InputError message={errors.description} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Event Type <span className="text-destructive">*</span></Label>
            <Select value={data.type} onValueChange={(v) => setData('type', v as Event['type'])}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="call">Call</SelectItem>
              </SelectContent>
            </Select>
            <InputError message={errors.type} />
          </div>
          <div className="grid gap-2">
            <Label className="text-sm font-medium">Location</Label>
            <Select value={data.location} onValueChange={(v) => setData('location', v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <InputError message={errors.location} />
          </div>
        </div>

        {/* Start date & time */}
        <div className="grid gap-2">
          <Label className="text-sm font-medium">Start Date & Time</Label>
          <div className="flex gap-2">
            <Popover modal>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('h-10 flex-1 justify-between font-normal', !data.start_date && 'text-muted-foreground')}>
                  {data.start_date ? format(data.start_date, 'MMM dd, yyyy') : <span>Select date</span>}
                  <ChevronDownIcon className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0 z-[9999] min-w-[400px]" align="start">
                <Calendar
                  className="w-full"
                  mode="single"
                  selected={data.start_date as Date}
                  captionLayout="dropdown"
                  defaultMonth={data.start_date as Date}
                  onSelect={(date) => setData('start_date', date as Date)}
                  disabled={dateDisabled}
                />
              </PopoverContent>
            </Popover>
            <Select value={data.start_time} onValueChange={(v) => setData('start_time', v)}>
              <SelectTrigger className="h-10 w-32"><SelectValue placeholder="Time" /></SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {TIME_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <InputError message={errors.start_date} />
        </div>

        {/* End date & time */}
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Checkbox id="has_end_date" checked={hasEndDate} onCheckedChange={(c) => setHasEndDate(c as boolean)} />
            <Label htmlFor="has_end_date" className="text-sm font-medium cursor-pointer">Set End Date & Time</Label>
          </div>
          {hasEndDate && (
            <div className="flex gap-2">
              <Popover modal>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('h-10 flex-1 justify-between font-normal', !data.end_date && 'text-muted-foreground')}>
                    {data.end_date ? format(data.end_date, 'MMM dd, yyyy') : <span>Select date</span>}
                    <ChevronDownIcon className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0 min-w-[400px]" align="start">
                  <Calendar
                    className="w-full"
                    mode="single"
                    selected={data.end_date as Date}
                    captionLayout="dropdown"
                    defaultMonth={data.end_date as Date}
                    onSelect={(date) => setData('end_date', date as Date)}
                    disabled={(date) => {
                      const max = new Date(); max.setFullYear(max.getFullYear() + 1)
                      if (data.start_date) {
                        const s = new Date(data.start_date as Date)
                        s.setHours(0, 0, 0, 0)
                        const d = new Date(date)
                        d.setHours(0, 0, 0, 0)
                        if (d < s) return true
                      }
                      return date > max
                    }}
                  />
                </PopoverContent>
              </Popover>
              <Select value={data.end_time} onValueChange={(v) => setData('end_time', v)}>
                <SelectTrigger className="h-10 w-32"><SelectValue placeholder="Time" /></SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {TIME_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <InputError message={errors.end_date} />
        </div>

        {/* Attendees */}
        {members && members.length > 0 && (
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="has_attendees"
                checked={hasAttendees}
                onCheckedChange={(c) => { setHasAttendees(c as boolean); if (!c) setData('attendees', []) }}
              />
              <Label htmlFor="has_attendees" className="text-sm font-medium cursor-pointer">Add Attendees</Label>
            </div>
            {hasAttendees && (
              <>
                <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`attendee-${member.id}`}
                        checked={data.attendees.includes(member.id)}
                        onCheckedChange={(c) => {
                          setData('attendees', c
                            ? [...data.attendees, member.id]
                            : data.attendees.filter(id => id !== member.id)
                          )
                        }}
                      />
                      <AppAvatar src={member.profile_picture?.url} name={member.name} size="sm" />
                      <Label htmlFor={`attendee-${member.id}`} className="text-sm font-normal cursor-pointer flex-1">
                        {member.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {data.attendees.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {data.attendees.length} attendee{data.attendees.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </>
            )}
            <InputError message={errors.attendees} />
          </div>
        )}
      </div>
    </BaseModal>
  )
}

// ─── EventViewModal (read-only detail view) ───────────────────────────────────

interface EventViewModalProps {
  event: Event
  isPast: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleComplete: () => void
}

export function EventViewModal({ event, isPast, onClose, onEdit, onDelete, onToggleComplete }: EventViewModalProps) {
  const type = event.type as EventType
  const attendees: User[] = Array.isArray(event.attendees) ? event.attendees : []
  const isCompleted = !!event.completed_at

  return (
    <BaseModal
      open
      onOpenChange={(open) => { if (!open) onClose() }}
      title={event.title}
      description={EVENT_TYPE_LABELS[type]}
      icon={<CalendarDays className="h-5 w-5 text-primary" />}
      className="sm:max-w-[520px]"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant={isCompleted ? 'secondary' : 'outline'}
            size="sm"
            className="gap-1.5"
            onClick={onToggleComplete}
          >
            {isCompleted
              ? <><CircleCheck className="w-3.5 h-3.5 text-emerald-500" />Completed</>
              : <><Circle className="w-3.5 h-3.5" />Mark Complete</>
            }
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={onDelete}>
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
            {!isPast && (
              <Button size="sm" className="gap-1.5" onClick={onEdit}>
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {isCompleted && (
          <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-2 rounded-md">
            <CircleCheck className="w-3.5 h-3.5" />
            Completed
          </div>
        )}
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Clock className={cn('w-4 h-4 shrink-0', EVENT_TYPE_ICON_COLOR[type])} />
            <div>
              <span className="font-medium text-foreground">{formatEventTime(event.start_date)}</span>
              {event.end_date && (
                <span className="ml-2 text-muted-foreground">
                  → {formatEventTime(event.end_date)}
                  <span className="ml-1 text-xs opacity-70">({calculateDuration(event.start_date, event.end_date)})</span>
                </span>
              )}
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <LocationIcon location={event.location} />
              <span>{EVENT_LOCATION_LABELS[event.location] ?? event.location}</span>
            </div>
          )}

          {attendees.length > 0 && (
            <div className="flex items-start gap-3 text-muted-foreground">
              <Users className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-2">
                {attendees.map((a) => (
                  <div key={a.id} className="flex items-center gap-1.5 text-xs">
                    <AppAvatar src={a.avatar} name={a.name} size="xs" />
                    <span className="text-foreground">{a.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event.description && (
            <>
              <Separator />
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </>
          )}

          <Separator />
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Activity</h4>
            <ActivityFeed subjectType="event" subjectId={event.id} />
          </div>
        </div>
      </div>
    </BaseModal>
  )
}
