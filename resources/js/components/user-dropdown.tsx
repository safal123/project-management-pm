import { UserStatusModal } from '@/components/modals/user-status-modal';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { type User } from '@/types';
import { type ReactNode, useRef, useState } from 'react';

export function UserDropdown({ user, children, side = 'bottom' }: { user: User; children: ReactNode; side?: 'top' | 'right' | 'bottom' | 'left' }) {
    const trigger = useRef<HTMLButtonElement>(null);
    const closeDialog = () => {
        setDialog(null);
        requestAnimationFrame(() => trigger.current?.focus());
    };
    const [open, setOpen] = useState(false);
    const [dialog, setDialog] = useState<'status' | 'help' | null>(null);
    return (
        <>
            <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger ref={trigger} asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side={side}
                    align="end"
                    sideOffset={8}
                    className="w-80 max-w-[calc(100vw-1rem)] overflow-y-auto rounded-xl p-0"
                    onCloseAutoFocus={(event) => {
                        if (dialog) event.preventDefault();
                    }}
                >
                    <UserMenuContent user={user} onStatusClick={() => setDialog('status')} onHelpClick={() => setDialog('help')} />
                </DropdownMenuContent>
            </DropdownMenu>
            {dialog === 'status' && <UserStatusModal user={user} onClose={closeDialog} />}
            <Dialog
                open={dialog === 'help'}
                onOpenChange={(value) => {
                    if (!value) closeDialog();
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Help &amp; support</DialogTitle>
                        <DialogDescription>A few ways to get started with your workspace.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 text-[13px] leading-relaxed">
                        <p>
                            <strong>Projects:</strong> Open a project from the sidebar to organize and assign tasks.
                        </p>
                        <p>
                            <strong>People:</strong> View teammates, their statuses, and workspace invitations.
                        </p>
                        <p>
                            <strong>Your status:</strong> Choose a preset or write your own. Availability is manually selected, not live presence.
                        </p>
                        <p>
                            <strong>Notifications:</strong> Muting pauses project invitation notifications. Password resets and security emails still
                            arrive.
                        </p>
                        <p className="text-muted-foreground">For account or access help, contact your workspace owner.</p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
