<?php

namespace App\Http\Controllers;

use App\Http\Requests\InvitationRequest;
use App\Http\Resources\InvitationResource;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class InvitationController extends Controller
{
    public function store(InvitationRequest $request)
    {
        $validated = $request->validated();

        $projectId = $validated['project_id'] ?? null;

        $alreadyInvited = Invitation::query()
            ->where('email', $validated['email'])
            ->where('workspace_id', $validated['workspace_id'])
            ->when(
                $projectId,
                fn ($query) => $query->where('project_id', $projectId),
                fn ($query) => $query->whereNull('project_id'),
            )
            ->exists();

        if ($alreadyInvited) {
            return redirect()
                ->back()
                ->withErrors([
                    'message' => $projectId
                        ? 'User is already invited to the project.'
                        : 'User is already invited to the workspace.',
                ]);
        }

        $user = User::where('email', $validated['email'])
            ->first();
        $invitation = Invitation::create([
            'workspace_id' => $validated['workspace_id'],
            'project_id' => $projectId,
            'invited_by' => auth()->user()->id,
            'invited_to' => $user?->id,
            'email' => $validated['email'] ?? $user?->email,
        ]);

        $invitation->refresh();

        $invitation->load('workspace', 'project', 'invitedBy', 'invitedTo');

        $invitation->sendEmail();

        return redirect()
            ->back()
            ->withSuccess('Invitation created successfully.');
    }

    public function show(string $token)
    {
        $invitation = Invitation::where('token', $token)
            ->with(['workspace', 'project', 'invitedBy'])
            ->firstOrFail();

        if ($invitation->isExpired() || $invitation->status !== 'pending') {
            return redirect()
                ->route('invitations.show', $token)
                ->withErrors([
                    'message' => $invitation->isExpired() ? 'Invitation expired.' : 'Invitation already processed.',
                ]);
        }

        if ($invitation->isLinkInvite() && Auth::check()) {
            $alreadyMember = $invitation->project
                ? $invitation->project->users()->where('users.id', Auth::id())->exists()
                : $invitation->workspace->users()->where('users.id', Auth::id())->exists();

            if ($alreadyMember) {
                return $invitation->project
                    ? redirect()->route('projects.show', $invitation->project->slug)
                    : redirect()->route('people.index');
            }
        }

        if ($invitation->isLinkInvite() && ! Auth::check()) {
            session(['url.intended' => url()->full()]);
        }

        return Inertia::render('invitations/show', [
            'invitation' => new InvitationResource($invitation),
        ]);
    }

    // resend invitation email
    public function resend(Invitation $invitation)
    {
        if ($invitation->status !== 'pending') {
            return redirect()
                ->back()
                ->withErrors(['message' => 'Invitation already processed.']);
        }

        // Can only resend once every day.
        if (
            $invitation->last_sent_at &&
            $invitation->last_sent_at->diffInDays(now()) < 1
        ) {
            return redirect()
                ->back()
                ->withErrors(['message' => 'You can only resend the invitation once every day.']);
        }

        $invitation->update([
            'last_sent_at' => now(),
        ]);

        $invitation->sendEmail();

        return redirect()
            ->back()
            ->withSuccess('Invitation email resent successfully.');
    }

    // approve invitation (admin only)
    public function approve(Invitation $invitation)
    {
        // Authorization check
        if ($invitation->project->created_by !== auth()->id()) {
            return redirect()
                ->back()
                ->withErrors(['message' => 'Only the project owner can approve invitations.']);
        }

        // Validate invitation
        if ($invitation->isExpired()) {
            return redirect()->back()->withErrors(['message' => 'Invitation expired.']);
        }

        if ($invitation->status !== 'pending') {
            return redirect()->back()->withErrors(['message' => 'Invitation already processed.']);
        }

        DB::transaction(function () use ($invitation) {
            // Get or create user
            $user = User::firstOrCreate(
                ['email' => $invitation->email],
                [
                    'password' => Hash::make(Str::random(32)),
                    'name' => $invitation->email,
                ]
            );

            // Attach to workspace if not already attached
            if (! $user->workspaces()->where('workspace_id', $invitation->workspace_id)->exists()) {
                $invitation->workspace->users()->attach($user->id);
            }

            // Attach to project
            $invitation->project->users()->syncWithoutDetaching([
                $user->id => ['joined_at' => now()],
            ]);

            // Mark invitation as accepted
            $invitation->update([
                'status' => 'accepted',
                'accepted_at' => now(),
                'invited_to' => $user->id,
            ]);
        });

        return redirect()
            ->back()
            ->withSuccess('Member approved and added to the project successfully.');
    }

    public function update(Request $request, string $token)
    {
        $request->validate([
            'status' => ['required', 'in:accepted,rejected'],
        ]);

        $invitation = Invitation::where('token', $token)->firstOrFail();

        if ($invitation->isLinkInvite() && $request->status === 'accepted' && ! Auth::check()) {
            session(['url.intended' => $invitation->signedUrl()]);

            return redirect()->route('login');
        }

        if ($invitation->isExpired()) {
            return back()->withErrors([
                'message' => 'Invitation expired.',
            ]);
        }

        if ($invitation->status !== 'pending') {
            return back()->withErrors([
                'message' => 'Invitation already processed.',
            ]);
        }

        DB::transaction(function () use ($invitation, $request) {

            if ($request->status === 'rejected') {
                if ($invitation->isLinkInvite()) {
                    return;
                }

                $invitation->update([
                    'status' => 'rejected',
                    'rejected_at' => now(),
                ]);

                return;
            }

            $user = $invitation->isLinkInvite()
                ? Auth::user()
                : User::firstOrCreate(
                    ['email' => $invitation->email],
                    [
                        'password' => Hash::make(Str::random(32)),
                        'name' => $invitation->email,
                    ]
                );

            if (! $user) {
                return;
            }

            // Attach to workspace if not already attached
            if (! $user->workspaces()->where('workspace_id', $invitation->workspace_id)->exists()) {
                $invitation->workspace->users()->attach($user->id);
            }

            // Set current workspace
            $user->current_workspace_id = $invitation->workspace_id;
            $user->save();
            $user->refresh(); // Refresh to load the relationship

            if ($invitation->project) {
                $invitation->project->users()->syncWithoutDetaching([
                    $user->id => ['joined_at' => now()],
                ]);
            }

            if (! $invitation->isLinkInvite()) {
                $invitation->update([
                    'status' => 'accepted',
                    'accepted_at' => now(),
                    'invited_to' => $user->id,
                ]);

                Auth::login($user);
            }
        });

        if ($invitation->isLinkInvite() && $request->status === 'rejected') {
            return redirect()->route('dashboard');
        }

        if ($invitation->project) {
            return redirect()
                ->route('projects.show', $invitation->project->slug)
                ->withSuccess(
                    $request->status === 'accepted'
                        ? 'Invitation accepted successfully.'
                        : 'Invitation rejected.'
                );
        }

        return redirect()
            ->route($request->status === 'accepted' ? 'people.index' : 'dashboard')
            ->withSuccess(
                $request->status === 'accepted'
                    ? 'Invitation accepted successfully.'
                    : 'Invitation rejected.'
            );
    }

    public function destroy(Invitation $invitation)
    {
        // Only allow the person who sent the invitation or project owner to cancel
        if ($invitation->invited_by !== auth()->id() && $invitation->project?->created_by !== auth()->id()) {
            return redirect()
                ->back()
                ->withErrors(['message' => 'You do not have permission to cancel this invitation.']);
        }

        // Only allow canceling pending invitations
        if ($invitation->status !== 'pending') {
            return redirect()
                ->back()
                ->withErrors(['message' => 'Only pending invitations can be cancelled.']);
        }

        $invitation->delete();

        return redirect()
            ->back()
            ->withSuccess('Invitation cancelled successfully.');
    }
}
