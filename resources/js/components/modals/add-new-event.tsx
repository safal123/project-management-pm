import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, ChevronDownIcon, Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import InputError from '@/components/input-error'
import { useForm, usePage } from '@inertiajs/react'
import { Event } from '@/types'
import { FormEventHandler } from 'react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { SharedData, User } from '@/types'
import AppAvatar from '@/components/app-avatar'

interface AddNewEventProps {
  event?: Event
  isEditMode?: boolean
  selectedDate?: Date
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const AddNewEvent = ({ event, isEditMode = false, selectedDate, open: controlledOpen, onOpenChange }: AddNewEventProps) => {
  const { members } = usePage<SharedData & { members: User[] }>().props
  const [internalOpen, setInternalOpen] = useState(false)
  const [hasEndDate, setHasEndDate] = useState(!!event?.end_date)
  const [hasAttendees, setHasAttendees] = useState(!!(event?.attendees && event.attendees.length > 0))

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen

  const generateTimeOptions = () => {
    const times: string[] = []
    for (let hour = 9;hour <= 17;hour++) {
      for (let minute = 0;minute < 60;minute += 15) {
        const h = hour.toString().padStart(2, '0')
        const m = minute.toString().padStart(2, '0')
        times.push(`${h}:${m}`)
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  const { data, setData, processing, errors, reset, post, transform } = useForm({
    title: event?.title || 'New Event',
    description: event?.description || 'This is a new event',
    type: event?.type || 'meeting',
    location: event?.location || 'office',
    start_date: event?.start_date || new Date(),
    start_time: event?.start_time || '09:00',
    end_date: event?.end_date || new Date(),
    end_time: event?.end_time || '10:00',
    attendees: event?.attendees?.map((attendee) => attendee.id) || [],
  })

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && selectedDate) {
      setData('start_date', selectedDate)
    }
  }

  useEffect(() => {
    if (open && selectedDate) {
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

    post(route('events.store'), {
      onSuccess: () => {
        toast.success("Event created successfully")
        reset()
        setOpen(false)
      },
      onError: () => {
        toast.error("Failed to create event")
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={submit}>
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold">
              {isEditMode ? "Edit Event" : "Create New Event"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isEditMode
                ? "Update your event details below."
                : "Add a new event to your calendar."}
            </DialogDescription>
          </DialogHeader>

          {Object.keys(errors).length > 0 && (
            <div className="mb-4 p-4 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">
                Please fix the errors below.
              </p>
            </div>
          )}
          <div className="grid gap-4 py-4">
            {/* Event Title */}
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

            {/* Event Description */}
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

            {/* Event Type and Location */}
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

            {/* Start Date & Time */}
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

            {/* End Date & Time */}
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
            {/* Attendees */}
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
                          {/* Avatar */}
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

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Event" : "Create Event"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddNewEvent
