<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateStatusRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserStatusController extends Controller
{
    public function update(UpdateStatusRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $text = trim($data['status_text'] ?? '');
        $expires = match ($data['clear_after']) {
            '30m' => now()->addMinutes(30),
            '1h' => now()->addHour(),
            '4h' => now()->addHours(4),
            'today' => now()->setTimezone($data['timezone'])->endOfDay()->utc(),
            'week' => now()->addWeek(),
            default => null,
        };

        $request->user()->forceFill([
            'availability' => $data['availability'],
            'status_text' => $text === '' ? null : $text,
            'status_emoji' => $text === '' ? null : ($data['status_emoji'] ?? null),
            'status_expires_at' => $text === '' ? null : $expires,
        ])->save();

        return back();
    }

    public function notifications(Request $request): RedirectResponse
    {
        $data = $request->validate(['notifications_muted' => ['required', 'boolean']]);
        $request->user()->forceFill($data)->save();

        return back();
    }
}
