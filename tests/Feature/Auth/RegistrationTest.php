<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Event;
use App\Listeners\CreateDefaultWorkspace;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register()
    {
        Event::fake();
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        Event::assertDispatched(Registered::class);
        Event::assertListening(Registered::class, CreateDefaultWorkspace::class);
        // user should have default workspace associated with them
        $user = User::where('email', 'test@example.com')->first();
        dd($user->currentWorkspace);
        $this->assertDatabaseHas('workspaces', [
            'created_by' => $user->id,
        ]);
        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
