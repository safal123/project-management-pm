<?php

use App\Listeners\CreateDefaultWorkspace;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Mockery\MockInterface;

use function Pest\Laravel\assertAuthenticated;
use function Pest\Laravel\assertGuest;
use function Pest\Laravel\get;

function mockGoogleUser(array $overrides = []): SocialiteUser
{
    $googleUser = Mockery::mock(SocialiteUser::class);
    $googleUser->shouldReceive('getId')->andReturn($overrides['id'] ?? 'google-123');
    $googleUser->shouldReceive('getName')->andReturn($overrides['name'] ?? 'Google User');
    $googleUser->shouldReceive('getEmail')->andReturn($overrides['email'] ?? 'google@example.com');
    $googleUser->shouldReceive('getAvatar')->andReturn($overrides['avatar'] ?? 'https://example.com/avatar.jpg');

    return $googleUser;
}

function mockGoogleDriver(SocialiteUser $googleUser): void
{
    Socialite::shouldReceive('driver')
        ->with('google')
        ->andReturn(Mockery::mock(\Laravel\Socialite\Contracts\Provider::class, function (MockInterface $provider) use ($googleUser) {
            $provider->shouldReceive('user')->andReturn($googleUser);
            $provider->shouldReceive('redirect')->andReturn(redirect('https://accounts.google.com'));
        }));
}

beforeEach(function () {
    config([
        'services.google.client_id' => 'test-client-id',
        'services.google.client_secret' => 'test-client-secret',
        'services.google.redirect' => 'http://localhost/auth/google/callback',
    ]);
});

test('the google redirect is available', function () {
    mockGoogleDriver(mockGoogleUser());

    get(route('auth.google'))
        ->assertRedirect('https://accounts.google.com');
});

test('google sign in creates a new user', function () {
    Event::fake([Registered::class]);
    mockGoogleDriver(mockGoogleUser());

    get(route('auth.google.callback'))
        ->assertRedirect(route('dashboard', absolute: false));

    assertAuthenticated();
    Event::assertDispatched(Registered::class);
    Event::assertListening(Registered::class, CreateDefaultWorkspace::class);

    $this->assertDatabaseHas('users', [
        'email' => 'google@example.com',
        'google_id' => 'google-123',
        'name' => 'Google User',
    ]);
});

test('google sign in logs in an existing user by google id', function () {
    $user = User::factory()->create([
        'email' => 'google@example.com',
        'google_id' => 'google-123',
    ]);

    mockGoogleDriver(mockGoogleUser());

    get(route('auth.google.callback'))
        ->assertRedirect(route('dashboard', absolute: false));

    assertAuthenticated();
    expect(auth()->id())->toBe($user->id);
    expect(User::query()->where('email', 'google@example.com')->count())->toBe(1);
});

test('google sign in links an existing account by email', function () {
    $user = User::factory()->create([
        'email' => 'google@example.com',
        'google_id' => null,
    ]);

    mockGoogleDriver(mockGoogleUser());

    get(route('auth.google.callback'))
        ->assertRedirect(route('dashboard', absolute: false));

    assertAuthenticated();
    expect($user->fresh()->google_id)->toBe('google-123');
});

test('google sign in is blocked when credentials are missing', function () {
    config([
        'services.google.client_id' => null,
        'services.google.client_secret' => null,
    ]);

    get(route('auth.google'))
        ->assertRedirect(route('login'));

    assertGuest();
});
