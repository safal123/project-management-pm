<?php

use App\Http\Controllers\CalendarController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProjectController;
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

    Route::resource('workspaces', WorkspaceController::class)
        ->only(['store']);

    Route::resource('projects', ProjectController::class)
        ->only(['index', 'store', 'show']);

    Route::resource('calendar', CalendarController::class)
        ->only(['index']);

    Route::post('workspace-switcher',  WorkspaceSwitcherController::class)
        ->name('workspace.switcher');

    Route::resource('tasks', TaskController::class)
        ->only(['store', 'destroy', 'update'])
        ->names('tasks');

    Route::post('tasks/reorder', [TaskController::class, 'reorder'])
        ->name('tasks.reorder');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
