<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\ComingSoonController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\GitIntegrationController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\MediaController;
use App\Http\Controllers\MoveTaskColumnController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ReorderTasksController;
use App\Http\Controllers\S3UploadController;
use App\Http\Controllers\TaskBranchController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\WorkspaceSwitcherController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    Route::get('people', [ComingSoonController::class, 'people'])->name('people.index');
    Route::get('activity', [ComingSoonController::class, 'activity'])->name('activity.index');
    Route::get('emails', [ComingSoonController::class, 'emails'])->name('emails.index');
    Route::get('billing', [ComingSoonController::class, 'billing'])->name('billing.index');
    Route::get('archive', [ComingSoonController::class, 'archive'])->name('archive.index');

    Route::resource('workspaces', WorkspaceController::class)
        ->only(['store']);

    Route::resource('projects', ProjectController::class)
        ->only(['index', 'store', 'show', 'update', 'destroy']);

    // TODO: Need to remove this.
    // Route::post('projects/{project}/members/invite', [ProjectController::class, 'inviteMember'])
    //     ->name('projects.members.invite');
    // Route::post('projects/{project}/members/{action}', [ProjectController::class, 'respondToInvitation'])
    //     ->whereIn('action', ['accept', 'reject'])
    //     ->name('projects.members.respond');
    // Route::delete('projects/{project}/members/{user}', [ProjectController::class, 'removeMember'])
    //     ->name('projects.members.remove');

    Route::resource('calendar', CalendarController::class)
        ->only(['index']);

    Route::post('workspace-switcher', WorkspaceSwitcherController::class)
        ->name('workspace.switcher');

    Route::resource('tasks', TaskController::class)
        ->only(['store', 'destroy', 'update'])
        ->names('tasks');

    Route::post('tasks/reorder', ReorderTasksController::class)
        ->name('tasks.reorder');

    Route::post('tasks/move', MoveTaskColumnController::class)
        ->name('tasks.move');

    Route::post('tasks/{task}/branch', TaskBranchController::class)
        ->name('tasks.branch.store');

    Route::resource('events', EventController::class)
        ->only(['store', 'update', 'destroy'])
        ->names('events');

    Route::post('events/{event}/toggle-complete', [EventController::class, 'toggleComplete'])
        ->name('events.toggle-complete');

    // S3 Upload
    Route::post('s3/upload', [S3UploadController::class, 'generateSignedUrl'])
        ->name('s3.upload');
    // Media Upload
    Route::post('media', [MediaController::class, 'uploadMedia'])
        ->name('media.upload');
    // Get media url
    Route::get('media/{media}', [MediaController::class, 'getMedia'])
        ->name('media.get-url');
    // Delete media
    Route::delete('media/{media}', [MediaController::class, 'deleteMedia'])
        ->name('media.delete');

    Route::post('likes/toggle', [LikeController::class, 'toggle'])
        ->name('likes.toggle');

    Route::get('comments', [CommentController::class, 'index'])
        ->name('comments.index');
    Route::post('comments', [CommentController::class, 'store'])
        ->name('comments.store');
    Route::patch('comments/{comment}', [CommentController::class, 'update'])
        ->name('comments.update');
    Route::delete('comments/{comment}', [CommentController::class, 'destroy'])
        ->name('comments.destroy');

    Route::get('activities', [ActivityController::class, 'index'])
        ->name('activities.index');

    Route::post('projects/{project}/git-integration', [GitIntegrationController::class, 'store'])
        ->name('git-integrations.store');
    Route::delete('projects/{project}/git-integration', [GitIntegrationController::class, 'destroy'])
        ->name('git-integrations.destroy');

    Route::post('invitations', [InvitationController::class, 'store'])
        ->name('invitations.store');
    Route::delete('invitations/{invitation}', [InvitationController::class, 'destroy'])
        ->name('invitations.destroy');

    Route::post('invitations/{invitation}/resend', [InvitationController::class, 'resend'])
        ->name('invitations.resend');

    Route::post('invitations/{invitation}/approve', [InvitationController::class, 'approve'])
        ->name('invitations.approve');
});

Route::middleware(['signed'])->group(function () {
    Route::get('invitations/{token}', [InvitationController::class, 'show'])
        ->name('invitations.show');
});

Route::post('invitations/{token}', [InvitationController::class, 'update'])
    ->name('invitations.update');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
