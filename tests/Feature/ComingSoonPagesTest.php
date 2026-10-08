<?php

use function Pest\Laravel\actingAs;
use function Pest\Laravel\get;

uses(Tests\Traits\CreatesTestData::class);

test('guests cannot access workspace coming soon pages', function (string $route) {
    get(route($route))->assertRedirect(route('login'));
})->with([
    'emails.index',
    'billing.index',
    'archive.index',
]);

test('authenticated users can view workspace coming soon pages', function (string $route, string $title) {
    ['user' => $user] = $this->createUserWithWorkspace();

    actingAs($user)
        ->get(route($route))
        ->assertOk()
        ->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
            ->component('coming-soon')
            ->where('title', $title)
        );
})->with([
    ['emails.index', 'Emails'],
    ['billing.index', 'Billing'],
    ['archive.index', 'Archive'],
]);
