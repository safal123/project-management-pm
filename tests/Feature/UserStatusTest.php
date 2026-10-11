<?php

use App\Actions\People\ListWorkspacePeople;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\ProjectInvitationNotification;

it('requires authentication to change status', function () {
    $this->patch(route('user-status.update'), [])->assertRedirect(route('login'));
});

it('saves only the current users status and expires it without changing availability', function () {
    $this->travelTo(now()->startOfMinute());
    $user = User::factory()->create();
    $other = User::factory()->create();
    $this->actingAs($user)->patch(route('user-status.update'), [
        'availability' => 'offline', 'status_text' => 'In a meeting', 'status_emoji' => '📅',
        'clear_after' => '30m', 'timezone' => 'Australia/Sydney', 'user_id' => $other->id,
    ])->assertSessionHasNoErrors()->assertRedirect();
    expect($user->fresh()->visibleStatus()['status_text'])->toBe('In a meeting');
    expect($user->fresh()->status_expires_at->equalTo(now()->addMinutes(30)))->toBeTrue();
    expect($other->fresh()->status_text)->toBeNull();
    $this->travel(31)->minutes();
    expect($user->fresh()->visibleStatus())->toMatchArray([
        'status_text' => null, 'status_emoji' => null, 'status_expires_at' => null, 'availability' => 'offline',
    ]);
});

it('supports every clear-after choice', function ($duration, $minutes) {
    $this->travelTo(now()->startOfMinute());
    $user = User::factory()->create();
    $this->actingAs($user)->patch(route('user-status.update'), [
        'availability' => 'online', 'status_text' => 'Focus', 'status_emoji' => '🎯',
        'clear_after' => $duration, 'timezone' => 'Australia/Sydney',
    ])->assertSessionHasNoErrors();
    expect($user->fresh()->status_expires_at?->toIso8601String())->toBe($minutes === null ? null : now()->addMinutes($minutes)->toIso8601String());
})->with([['never', null], ['1h', 60], ['4h', 240], ['week', 10080]]);

it('clears today at the users local end of day', function () {
    $this->travelTo(\Carbon\Carbon::parse('2026-10-11 02:00:00', 'UTC'));
    $user = User::factory()->create();
    $this->actingAs($user)->patch(route('user-status.update'), [
        'availability' => 'online', 'status_text' => 'Working remotely',
        'clear_after' => 'today', 'timezone' => 'Australia/Sydney',
    ])->assertSessionHasNoErrors();
    expect($user->fresh()->status_expires_at->utc()->format('Y-m-d H:i:s'))->toBe('2026-10-11 12:59:59');
});

it('can clear the status explicitly', function () {
    $user = User::factory()->create(['status_text' => 'Busy', 'status_emoji' => '💻', 'status_expires_at' => now()->addHour()]);
    $this->actingAs($user)->patch(route('user-status.update'), [
        'availability' => 'online', 'status_text' => '', 'clear_after' => 'never', 'timezone' => 'UTC',
    ])->assertSessionHasNoErrors();
    expect($user->fresh()->visibleStatus())->toMatchArray(['status_text' => null, 'status_emoji' => null, 'status_expires_at' => null]);
});

it('validates status input', function () {
    $this->actingAs(User::factory()->create())->patch(route('user-status.update'), [
        'availability' => 'invisible', 'status_text' => str_repeat('x', 101), 'status_emoji' => str_repeat('x', 33),
        'clear_after' => 'year', 'timezone' => 'invalid',
    ])->assertSessionHasErrors(['availability', 'status_text', 'status_emoji', 'clear_after', 'timezone']);
});

it('includes the status for workspace teammates', function () {
    $user = User::factory()->create(['status_text' => 'Deep work', 'status_emoji' => '💻']);
    $workspace = Workspace::factory()->create(['created_by' => $user->id]);
    $workspace->users()->attach($user->id, ['role' => 'owner']);
    $people = app(ListWorkspacePeople::class)->execute($workspace, $user)['people'];
    expect($people->firstWhere('id', $user->id)['status_text'])->toBe('Deep work');
});

it('persists mute preference and suppresses project notification channels', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->patch(route('user-notifications.update'), ['notifications_muted' => true])->assertSessionHasNoErrors();
    $notification = new ProjectInvitationNotification(new Project, $user);
    expect($notification->via($user->fresh()))->toBe([]);
    expect($notification->shouldSend($user->fresh(), 'mail'))->toBeFalse();
    $this->patch(route('user-notifications.update'), ['notifications_muted' => false])->assertSessionHasNoErrors();
    expect($notification->via($user->fresh()))->toBe(['mail']);
});
