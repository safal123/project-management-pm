<?php

use App\Models\Event;
use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('project calendar tab lists only that project events', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $workspace = $workspaces->first();
    $project = $this->createProjectsForUser($user, $workspace)->first();
    $otherProject = $this->createProjectsForUser($user, $workspace)->first();

    $this->createEventForWorkspace($user, $workspace, [
        'title' => 'Project standup',
        'project_id' => $project->id,
        'start_date' => now(),
    ]);
    $this->createTaskForProject($user, $project, [
        'title' => 'Ship calendar',
        'due_date' => now(),
    ]);
    $this->createEventForWorkspace($user, $workspace, [
        'title' => 'Other project sync',
        'project_id' => $otherProject->id,
        'start_date' => now(),
    ]);

    actingAs($user)
        ->get(route('projects.show', ['project' => $project->slug, 'tab' => 'calendar']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('projects/project/index')
            ->has('calendarEvents', 1)
            ->where('calendarEvents.0.title', 'Project standup')
            ->has('tableEvents.data', 1)
            ->where('tableEvents.data.0.title', 'Project standup')
            ->has('dueDateCards', 1)
            ->where('dueDateCards.0.title', 'Ship calendar')
            ->where('filters.view', 'week')
        );
});

test('creating an event from a project redirects to that project calendar', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first())->first();

    actingAs($user)
        ->post(route('events.store'), [
            'title' => 'Design review',
            'type' => 'meeting',
            'start_date' => now()->addDay()->format('Y-m-d'),
            'start_time' => '09:00',
            'project_id' => $project->id,
        ])
        ->assertRedirect(route('projects.show', ['project' => $project->slug, 'tab' => 'calendar']));

    expect(Event::query()->where('title', 'Design review')->where('project_id', $project->id)->exists())->toBeTrue();
});
