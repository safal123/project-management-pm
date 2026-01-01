import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppAvatar from '@/components/app-avatar';
import { CheckCircle2, XCircle, Clock, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  token: string;
  expires_at: string;
  invited_at: string;
  accepted_at?: string;
  rejected_at?: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  project: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  invited_by: {
    id: string;
    name: string;
    email: string;
    profile_picture?: {
      url: string;
    };
  };
}

interface Props {
  invitation: Invitation;
  errors?: {
    message?: string;
  };
}

export default function Show({ invitation, errors }: Props) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleAccept = () => {
    setIsAccepting(true);
    router.post(
      route('invitations.update', invitation.token),
      { status: 'accepted' },
      {
        onFinish: () => setIsAccepting(false),
        onError: () => setIsAccepting(false),
      }
    );
  };

  const handleReject = () => {
    if (!confirm('Are you sure you want to reject this invitation?')) {
      return;
    }

    setIsRejecting(true);
    router.post(
      route('invitations.update', invitation.token),
      { status: 'rejected' },
      {
        onFinish: () => setIsRejecting(false),
        onError: () => setIsRejecting(false),
      }
    );
  };

  const isExpired = new Date(invitation.expires_at) < new Date();
  const isPending = invitation.status === 'pending';
  const isProcessed = invitation.status !== 'pending';

  return (
    <>
      <Head title="Project Invitation" />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="flex justify-center">
              <div className="relative">
                <AppAvatar
                  src={invitation.invited_by.profile_picture?.url}
                  name={invitation.invited_by.name}
                  size="2xl"
                  className="ring-4 ring-background shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2">
                  <Mail className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div>
              <CardTitle className="text-3xl font-bold mb-2">
                You're Invited!
              </CardTitle>
              <CardDescription className="text-base">
                <span className="font-semibold text-foreground">
                  {invitation.invited_by.name}
                </span>{' '}
                has invited you to collaborate
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Message */}
            {errors?.message && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 flex items-start gap-3">
                <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Unable to process invitation</p>
                  <p className="text-sm mt-1 opacity-90">{errors.message}</p>
                </div>
              </div>
            )}

            {/* Status Messages */}
            {isExpired && (
              <div className="bg-muted border rounded-lg p-4 flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium">Invitation Expired</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    This invitation link has expired. Please ask{' '}
                    {invitation.invited_by.name} to send you a new invitation.
                  </p>
                </div>
              </div>
            )}

            {isProcessed && (
              <div
                className={cn(
                  'border rounded-lg p-4 flex items-start gap-3',
                  invitation.status === 'accepted'
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
                    : 'bg-muted border'
                )}
              >
                {invitation.status === 'accepted' ? (
                  <CheckCircle2 className="h-5 w-5 mt-0.5 text-green-600 dark:text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium">
                    Invitation {invitation.status === 'accepted' ? 'Accepted' : 'Rejected'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {invitation.status === 'accepted'
                      ? 'You have already accepted this invitation.'
                      : 'You have rejected this invitation.'}
                  </p>
                </div>
              </div>
            )}

            {/* Project Details */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Project</p>
                <p className="text-xl font-semibold">{invitation.project.name}</p>
                {invitation.project.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {invitation.project.description}
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-1">Workspace</p>
                <p className="font-medium">{invitation.workspace.name}</p>
              </div>

              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Invited to</p>
                  <p className="text-sm font-medium">{invitation.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {isExpired ? 'Expired' : 'Expires'}
                  </p>
                  <p className="text-sm font-medium">
                    {new Date(invitation.expires_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isPending && !isExpired && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAccept}
                  disabled={isAccepting || isRejecting}
                  className="flex-1"
                  size="lg"
                >
                  {isAccepting ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Accept Invitation
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleReject}
                  disabled={isAccepting || isRejecting}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  {isRejecting ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Decline
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Footer Info */}
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                By accepting this invitation, you'll gain access to collaborate on this project
                with the team.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

