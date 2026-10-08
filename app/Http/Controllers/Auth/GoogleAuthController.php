<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        if (! $this->configured()) {
            return redirect()
                ->route('login')
                ->withErrors(['email' => 'Google sign-in is not configured.']);
        }

        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        if (! $this->configured()) {
            return redirect()
                ->route('login')
                ->withErrors(['email' => 'Google sign-in is not configured.']);
        }

        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (Throwable) {
            return redirect()
                ->route('login')
                ->withErrors(['email' => 'Google sign-in failed. Please try again.']);
        }

        $email = $googleUser->getEmail();

        if (! $email) {
            return redirect()
                ->route('login')
                ->withErrors(['email' => 'Google did not provide an email address.']);
        }

        $user = $this->findOrCreateUser($googleUser, $email);

        Auth::login($user, remember: true);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    protected function findOrCreateUser(SocialiteUser $googleUser, string $email): User
    {
        $user = User::query()->where('google_id', $googleUser->getId())->first();

        if ($user) {
            return $user;
        }

        $user = User::query()->where('email', $email)->first();

        if ($user) {
            $user->forceFill([
                'google_id' => $googleUser->getId(),
                'avatar' => $user->avatar ?: $googleUser->getAvatar(),
            ])->save();

            return $user;
        }

        $user = User::query()->create([
            'name' => $googleUser->getName() ?: Str::before($email, '@'),
            'email' => $email,
            'google_id' => $googleUser->getId(),
            'avatar' => $googleUser->getAvatar(),
            'password' => Hash::make(Str::random(32)),
        ]);

        $user->forceFill([
            'email_verified_at' => now(),
        ])->save();

        event(new Registered($user));

        return $user;
    }

    protected function configured(): bool
    {
        return filled(config('services.google.client_id'))
            && filled(config('services.google.client_secret'));
    }
}
