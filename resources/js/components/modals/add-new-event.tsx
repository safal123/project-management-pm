import { useState, useEffect } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import { Event, SharedData, User } from '@/types'
import { BaseModal } from './base-modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import InputError from '@/components/input-error'
import AppAvatar from '@/components/app-avatar'
import { Plus, CalendarPlus, Pencil, ChevronDownIcon, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { FormEventHandler } from 'react'

interface AddNewEventProps {
  event?: Event
  selectedDate?: Date
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const AddNewEvent = ({ event, selectedDate, open: controlledOpen, onOpenChange }: AddNewEventProps) => {
  const { members } = usePage<SharedData & { members: User[] }>().props
  const [internalOpen, setInternalOpen] = useState(false)
  const [hasEndDate, setHasEndDate] = useState(false)
  const [hasAttendees, setHasAttendees] = useState(false)

  const isEditMode = !!event
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen

  const extractTime = (dateStr: string | Date | undefined): string => {
    if (!dateStr) return '09:00'
    const d = new Date(dateStr)
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const generateTimeOptions = () => {
    const times: string[] = []
    for (let hour = 0; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const h = hour.toString().padStart(2, '0')
        const m = minute.toString().padStart(2, '0')
        times.push(`${h}:${m}`)
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  const getInitialValues = () => ({
    title: event?.title || '',
    description: event?.description || '',
    type: event?.type || 'meeting',
    location: event?.location || 'office',
    start_date: event?.start_date ? new Date(event.start_date) : (selectedDate || new Date()),
    start_time: event?.start_date ? extractTime(event.start_date) : '09:00',
    end_date: event?.end_date ? new Date(event.end_date) : new Date(),
    end_time: event?.end_date ? extractTime(event.end_date) : '10:00',
    attendees: event?.attendees?.map((a) => a.id) || [],
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

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && selectedDate && !isEditMode) {
      setData('start_date', selectedDate)
    }
    if (!isOpen && !isEditMode) {
      reset()
      setHasEndDate(false)
      setHasAttendees(false)
    }
  }

  useEffect(() => {
    if (open && selectedDate && !isEditMode) {
      setData('start_date', selectedDate)
      if (hasEndDate) {
        setData('end_date', selectedDate)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, open])

  const submit: FormEventHandler = (e) => {
    e.preventDefault()

    transform((data) => ({
      title: data.title,
      description: data.description,
      type: data.type,
      location: data.location,
      start_date: data.start_date,
      start_time: data.start_time,
      ...(hasAttendees && {
        attendees: data.attendees,
      }),
      ...(hasEndDate && {
        end_date: data.end_date,
        end_time: data.end_time,
      }),
    }))

    if (isEditMode) {
      put(route('events.update', event.id), {
        onSuccess: () => {
          toast.success('Event updated successfully')
          setOpen(false)
        },
        onError: () => {
          toast.error('Failed to update event')
        },
      })
    } else {
      post(route('events.store'), {
        onSuccess: () => {
          toast.success('Event created successfully')
          reset()
          setOpen(false)
        },
        onError: () => {
          toast.error('Failed to create event')
        },
      })
    }
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
      description={
        isEditMode
          ? 'Update your event details below.'
          : 'Add a new event to your calendar.'
      }
      className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
      formProps={{ onSubmit: submit }}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={processing} className="gap-2">
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                {isEditMode ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {isEditMode ? 'Update Event' : 'Create Event'}
              </>
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
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => setData('description', e.target.value)}
            placeholder="Add event details..."
            className="resize-none"
            rows={3}
          />
          <InputError message={errors.description} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="type" className="text-sm font-medium">
              Event Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.type}
              onValueChange={(value) => setData('type', value as Event['type'])}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
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
            <Label htmlFor="location" className="text-sm font-medium">
              Location
            </Label>
            <Select
              value={data.location}
              onValueChange={(value) => setData('location', value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <InputError message={errors.location} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label className="text-sm font-medium">Start Date & Time</Label>
          <div className="flex gap-2">
            <Popover modal={true}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'h-10 flex-1 justify-between font-normal',
                    !data.start_date && 'text-muted-foreground'
                  )}
                >
                  {data.start_date ? (
                    format(data.start_date, 'MMM dd, yyyy')
                  ) : (
                    <span>Select date</span>
                  )}
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
                  onSelect={(date) => {
                    setData('start_date', date as Date)
                  }}
                />
              </PopoverContent>
            </Popover>
            <Select
              value={data.start_time}
              onValueChange={(value) => setData('start_time', value)}
            >
              <SelectTrigger className="h-10 w-32">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {timeOptions.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <InputError message={errors.start_date} />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="has_end_date"
              checked={hasEndDate}
              onCheckedChange={(checked) => setHasEndDate(checked as boolean)}
            />
            <Label htmlFor="has_end_date" className="text-sm font-medium cursor-pointer">
              Set End Date & Time
            </Label>
          </div>

          {hasEndDate && (
            <div className="flex gap-2">
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'h-10 flex-1 justify-between font-normal',
                      !data.end_date && 'text-muted-foreground'
                    )}
                  >
                    {data.end_date ? (
                      format(data.end_date, 'MMM dd, yyyy')
                    ) : (
                      <span>Select date</span>
                    )}
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
                    onSelect={(date) => {
                      setData('end_date', date as Date)
                    }}
                    disabled={(date) =>
                      data.start_date ? date < data.start_date : false
                    }
                  />
                </PopoverContent>
              </Popover>
              <Select
                value={data.end_time}
                onValueChange={(value) => setData('end_time', value)}
              >
                <SelectTrigger className="h-10 w-32">
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <InputError message={errors.end_date} />
        </div>

        {members && members.length > 0 && (
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="has_attendees"
                checked={hasAttendees}
                onCheckedChange={(checked) => {
                  setHasAttendees(checked as boolean)
                  if (!checked) {
                    setData('attendees', [])
                  }
                }}
              />
              <Label htmlFor="has_attendees" className="text-sm font-medium cursor-pointer">
                Add Attendees
              </Label>
            </div>

            {hasAttendees && (
              <>
                <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`attendee-${member.id}`}
                        checked={data.attendees.includes(member.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setData('attendees', [...data.attendees, member.id])
                          } else {
                            setData('attendees', data.attendees.filter(id => id !== member.id))
                          }
                        }}
                      />
                      <AppAvatar
                        src={member.profile_picture?.url}
                        name={member.name}
                        size="sm"
                      />
                      <Label
                        htmlFor={`attendee-${member.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {member.name}
                      </Label>
                    </div>
                  ))}
                </div>
                {data.attendees.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {data.attendees.length} attendee{data.attendees.length > 1 ? 's' : ''} selected
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

export default AddNewEvent
