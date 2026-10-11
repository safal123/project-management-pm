import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useVisibleStatus } from '@/components/user-status';
import { type User } from '@/types';
import { useForm } from '@inertiajs/react';
import { Clock, LoaderCircle, Smile } from 'lucide-react';
import { useState, type FormEvent } from 'react';

const presets = [
    ['📅', 'In a meeting'],
    ['🚗', 'Commuting'],
    ['🤒', 'Sick'],
    ['🌴', 'Vacationing'],
    ['🏡', 'Working remotely'],
    ['💻', 'Deep work'],
    ['☕', 'On a break'],
    ['🎯', 'Focusing'],
];
const durations = [
    ['never', 'Never'],
    ['30m', '30m'],
    ['1h', '1h'],
    ['4h', '4h'],
    ['today', 'Today'],
    ['week', 'Week'],
];

// Mounted fresh when opened so cancel discards drafts and server errors.
export function UserStatusModal({ user, onClose }: { user: User; onClose: () => void }) {
    const current = useVisibleStatus(user);
    const [emojiOpen, setEmojiOpen] = useState(false);
    const form = useForm({
        availability: user.availability || 'online',
        status_text: current.text || '',
        status_emoji: current.emoji || '',
        clear_after: 'never',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.patch(route('user-status.update'), { preserveScroll: true, onSuccess: onClose });
    };
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !form.processing) onClose();
            }}
        >
            <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-xl p-0 sm:max-w-[460px]">
                <form onSubmit={submit}>
                    <div className="space-y-5 p-5">
                        <DialogHeader className="gap-1 text-left">
                            <DialogTitle className="text-base font-semibold">Set your status</DialogTitle>
                            <DialogDescription className="text-[12px]">Visible to other workspace members</DialogDescription>
                        </DialogHeader>
                        <fieldset className="space-y-2">
                            <legend className="text-muted-foreground mb-2 text-[12px] font-medium">Availability</legend>
                            <div className="bg-muted/50 grid grid-cols-2 gap-1 rounded-lg border p-1">
                                {(['online', 'offline'] as const).map((value) => (
                                    <label
                                        key={value}
                                        className={`has-focus-visible:ring-ring flex cursor-pointer items-center justify-center gap-2 rounded-md px-2 py-2 text-[13px] has-focus-visible:ring-2 ${form.data.availability === value ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                                    >
                                        <input
                                            className="sr-only"
                                            type="radio"
                                            name="availability"
                                            value={value}
                                            checked={form.data.availability === value}
                                            onChange={() => form.setData('availability', value)}
                                        />
                                        <span className={`size-2 rounded-full ${value === 'online' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                                        {value === 'online' ? 'Online' : 'Appear offline'}
                                    </label>
                                ))}
                            </div>
                            <InputError message={form.errors.availability} />
                        </fieldset>
                        <div className="space-y-2">
                            <label htmlFor="user-status" className="text-muted-foreground text-[12px] font-medium">
                                Status
                            </label>
                            <div className="relative">
                                <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            aria-label="Choose status emoji"
                                            className="focus-visible:outline-ring absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-center rounded-l-lg focus-visible:outline-2"
                                        >
                                            {form.data.status_emoji || <Smile className="text-muted-foreground size-4" />}
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[100] w-60 p-2">
                                        <div className="grid grid-cols-4 gap-1">
                                            {[...presets, ['✅', 'Available'], ['🎧', 'Headphones'], ['✈️', 'Traveling'], ['', 'Remove emoji']].map(
                                                ([emoji, label]) => (
                                                    <button
                                                        key={label}
                                                        type="button"
                                                        aria-label={label}
                                                        className="hover:bg-muted rounded p-2"
                                                        onClick={() => {
                                                            form.setData('status_emoji', emoji);
                                                            setEmojiOpen(false);
                                                        }}
                                                    >
                                                        {emoji || '×'}
                                                    </button>
                                                ),
                                            )}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <Input
                                    id="user-status"
                                    value={form.data.status_text}
                                    maxLength={100}
                                    onChange={(e) => form.setData('status_text', e.target.value)}
                                    placeholder="What's your status?"
                                    className="bg-muted/30 h-11 pl-10 text-[13px]"
                                    aria-invalid={!!form.errors.status_text}
                                    aria-describedby="status-error"
                                />
                            </div>
                            <InputError id="status-error" message={form.errors.status_text || form.errors.status_emoji} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {presets.map(([emoji, text]) => (
                                <button
                                    key={text}
                                    type="button"
                                    onClick={() => form.setData((data) => ({ ...data, status_text: text, status_emoji: emoji }))}
                                    className={`hover:bg-muted focus-visible:outline-ring flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[12px] transition-colors focus-visible:outline-2 ${form.data.status_text === text ? 'border-ring/40 bg-muted' : ''}`}
                                >
                                    <span className="text-base">{emoji}</span>
                                    {text}
                                </button>
                            ))}
                        </div>
                        <fieldset>
                            <legend className="text-muted-foreground mb-2 flex items-center gap-2 text-[12px] font-medium">
                                <Clock className="size-3.5" />
                                Clear after
                            </legend>
                            <div className="bg-muted/50 grid grid-cols-3 gap-1 rounded-lg border p-1 sm:grid-cols-6">
                                {durations.map(([value, label]) => (
                                    <label
                                        key={value}
                                        className={`has-focus-visible:ring-ring cursor-pointer rounded-md py-2 text-center text-[12px] has-focus-visible:ring-2 ${form.data.clear_after === value ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
                                    >
                                        <input
                                            type="radio"
                                            className="sr-only"
                                            name="clear_after"
                                            value={value}
                                            checked={form.data.clear_after === value}
                                            onChange={() => form.setData('clear_after', value)}
                                        />
                                        {label}
                                    </label>
                                ))}
                            </div>
                            <InputError message={form.errors.clear_after || form.errors.timezone} />
                            {user.status_expires_at && current.text && (
                                <p className="text-muted-foreground mt-2 text-[11px]">Saving starts a new clear-after period.</p>
                            )}
                        </fieldset>
                    </div>
                    <div className="flex items-center justify-between border-t px-5 py-4">
                        <Button
                            type="button"
                            variant="ghost"
                            className="hover:border-border focus-visible:border-border border border-transparent"
                            disabled={form.processing}
                            onClick={() => form.setData((data) => ({ ...data, status_text: '', status_emoji: '', clear_after: 'never' }))}
                        >
                            Clear status
                        </Button>
                        <Button type="submit" disabled={form.processing} className="h-9 px-4">
                            {form.processing && <LoaderCircle className="size-3.5 animate-spin" />}Save status
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
