<?php

use App\Models\Activity;
use App\Models\Event;
use App\Models\Task;

use function Pest\Laravel\actingAs;

uses(Tests\Traits\CreatesTestData::class);

test('creating a task records a created activity', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();

    actingAs($user)->post(route('tasks.store'), [
        'title' => 'New task',
        'description' => 'Task description',
        'project_id' => $project->id,
        'workspace_id' => $project->workspace_id,
    ])->assertRedirect();

    $task = Task::query()->where('project_id', $project->id)->where('title', 'New task')->firstOrFail();

    expect(Activity::query()
        ->where('subject_type', Task::class)
        ->where('subject_id', $task->id)
        ->where('type', Activity::TYPE_CREATED)
        ->exists())->toBeTrue();
});

test('changing a task status records a status_changed activity', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project, ['status' => 'todo']);

    actingAs($user)
        ->patch(route('tasks.update', $task), ['status' => 'done'])
        ->assertRedirect();

    $activity = Activity::query()
        ->where('subject_type', Task::class)
        ->where('subject_id', $task->id)
        ->where('type', Activity::TYPE_STATUS_CHANGED)
        ->first();

    expect($activity)->not->toBeNull()
        ->and($activity->properties)->toBe(['from' => 'todo', 'to' => 'done']);
});

test('reassigning a task records an assigned activity', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);

    actingAs($user)
        ->patch(route('tasks.update', $task), ['assigned_to' => $user->id])
        ->assertRedirect();

    expect(Activity::query()
        ->where('subject_type', Task::class)
        ->where('subject_id', $task->id)
        ->where('type', Activity::TYPE_ASSIGNED)
        ->exists())->toBeTrue();
});

test('moving a task between columns records a moved activity', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();

    $fromColumn = $this->createTaskForProject($user, $project, ['title' => 'To Do']);
    $toColumn = $this->createTaskForProject($user, $project, ['title' => 'Done']);
    $task = $this->createTaskForProject($user, $project, ['parent_task_id' => $fromColumn->id]);

    actingAs($user)
        ->post(route('tasks.reorder'), [
            'taskIds' => [$task->id],
            'moved_task_id' => $task->id,
            'parent_task_id' => $toColumn->id,
        ])
        ->assertRedirect();

    $activity = Activity::query()
        ->where('subject_type', Task::class)
        ->where('subject_id', $task->id)
        ->where('type', Activity::TYPE_MOVED)
        ->first();

    expect($activity)->not->toBeNull()
        ->and($activity->properties)->toBe(['from' => 'To Do', 'to' => 'Done']);
});

test('commenting on a task records a commented activity', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);

    actingAs($user)
        ->postJson(route('comments.store'), [
            'commentable_type' => 'task',
            'commentable_id' => $task->id,
            'body' => 'Nice work!',
        ])
        ->assertCreated();

    expect(Activity::query()
        ->where('subject_type', Task::class)
        ->where('subject_id', $task->id)
        ->where('type', Activity::TYPE_COMMENTED)
        ->exists())->toBeTrue();
});

test('liking a task records a liked activity', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);

    actingAs($user)
        ->postJson(route('likes.toggle'), [
            'likeable_type' => 'task',
            'likeable_id' => $task->id,
        ])
        ->assertOk();

    expect(Activity::query()
        ->where('subject_type', Task::class)
        ->where('subject_id', $task->id)
        ->where('type', Activity::TYPE_LIKED)
        ->exists())->toBeTrue();
});

test('unliking a task does not record an additional activity', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);

    $payload = ['likeable_type' => 'task', 'likeable_id' => $task->id];

    actingAs($user)->postJson(route('likes.toggle'), $payload)->assertOk();
    actingAs($user)->postJson(route('likes.toggle'), $payload)->assertOk();

    expect(Activity::query()
        ->where('subject_type', Task::class)
        ->where('subject_id', $task->id)
        ->where('type', Activity::TYPE_LIKED)
        ->count())->toBe(1);
});

test('creating an event records a created activity', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();

    actingAs($user)->post(route('events.store'), [
        'title' => 'Sprint Planning',
        'type' => 'meeting',
        'start_date' => now()->addDay()->format('Y-m-d'),
        'start_time' => '09:00',
    ])->assertRedirect();

    $event = Event::query()->where('title', 'Sprint Planning')->firstOrFail();

    expect(Activity::query()
        ->where('subject_type', Event::class)
        ->where('subject_id', $event->id)
        ->where('type', Activity::TYPE_CREATED)
        ->exists())->toBeTrue();
});

test('rescheduling an event records a moved activity', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $event = $this->createEventForWorkspace($user, $workspaces->first());

    actingAs($user)
        ->put(route('events.update', $event), [
            'title' => $event->title,
            'type' => $event->type,
            'start_date' => now()->addWeek()->format('Y-m-d'),
            'start_time' => '10:00',
        ])
        ->assertRedirect();

    expect(Activity::query()
        ->where('subject_type', Event::class)
        ->where('subject_id', $event->id)
        ->where('type', Activity::TYPE_MOVED)
        ->exists())->toBeTrue();
});

test('renaming a task records a title_changed activity', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project, ['title' => 'Old title']);

    actingAs($user)
        ->patch(route('tasks.update', $task), ['title' => 'New title'])
        ->assertRedirect();

    $activity = Activity::query()
        ->where('subject_type', Task::class)
        ->where('subject_id', $task->id)
        ->where('type', Activity::TYPE_TITLE_CHANGED)
        ->first();

    expect($activity)->not->toBeNull()
        ->and($activity->properties)->toBe(['from' => 'Old title', 'to' => 'New title']);
});

test('changing a due date records a due_date_changed activity', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project, ['due_date' => '2026-10-01']);

    actingAs($user)
        ->patch(route('tasks.update', $task), ['due_date' => '2026-10-15'])
        ->assertRedirect();

    $activity = Activity::query()
        ->where('subject_type', Task::class)
        ->where('subject_id', $task->id)
        ->where('type', Activity::TYPE_DUE_DATE_CHANGED)
        ->first();

    expect($activity)->not->toBeNull()
        ->and($activity->properties)->toBe(['from' => '2026-10-01', 'to' => '2026-10-15']);
});

test('adding a dependency records a dependency_changed activity', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $blocker = $this->createTaskForProject($user, $project, ['title' => 'Blocker']);
    $task = $this->createTaskForProject($user, $project, ['title' => 'Blocked']);

    actingAs($user)
        ->patch(route('tasks.update', $task), ['depends_on_task_id' => $blocker->id])
        ->assertRedirect();

    $activity = Activity::query()
        ->where('subject_type', Task::class)
        ->where('subject_id', $task->id)
        ->where('type', Activity::TYPE_DEPENDENCY_CHANGED)
        ->first();

    expect($activity)->not->toBeNull()
        ->and($activity->properties['to'])->toBe($blocker->id)
        ->and($activity->properties['to_title'])->toBe('Blocker');
});

test('adding a subtask records a subtask_added activity on the parent', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $column = $this->createTaskForProject($user, $project, ['parent_task_id' => null, 'title' => 'To do']);
    $card = $this->createTaskForProject($user, $project, ['parent_task_id' => $column->id, 'title' => 'Parent card']);

    actingAs($user)->post(route('tasks.store'), [
        'title' => 'Child work',
        'project_id' => $project->id,
        'workspace_id' => $project->workspace_id,
        'parent_task_id' => $card->id,
    ])->assertRedirect();

    expect(Activity::query()
        ->where('subject_type', Task::class)
        ->where('subject_id', $card->id)
        ->where('type', Activity::TYPE_SUBTASK_ADDED)
        ->exists())->toBeTrue();
});

test('uploading a file to a task records a file_uploaded activity', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $project = $this->createProjectsForUser($user, $workspaces->first(), 1)->first();
    $task = $this->createTaskForProject($user, $project);

    Illuminate\Support\Facades\Storage::fake('s3');
    Illuminate\Support\Facades\Storage::disk('s3')->put('uploads/brief.pdf', 'pdf');

    actingAs($user)
        ->post(route('media.upload'), [
            'path' => 'uploads/brief.pdf',
            'filename' => 'brief.pdf',
            'original_filename' => 'brief.pdf',
            'filetype' => 'application/pdf',
            'filesize' => 3,
            'workspace_id' => $task->workspace_id,
            'mediable_id' => $task->id,
            'mediable_type' => 'task',
        ])
        ->assertRedirect();

    expect(Activity::query()
        ->where('subject_type', Task::class)
        ->where('subject_id', $task->id)
        ->where('type', Activity::TYPE_FILE_UPLOADED)
        ->exists())->toBeTrue();
});

test('toggling event completion records a completed activity', function () {
    ['user' => $user, 'workspaces' => $workspaces] = $this->createUserWithWorkspace();
    $event = $this->createEventForWorkspace($user, $workspaces->first());

    actingAs($user)
        ->post(route('events.toggle-complete', $event))
        ->assertRedirect();

    $activity = Activity::query()
        ->where('subject_type', Event::class)
        ->where('subject_id', $event->id)
        ->where('type', Activity::TYPE_COMPLETED)
        ->first();

    expect($activity)->not->toBeNull()
        ->and($activity->properties)->toBe(['completed' => true]);
});
