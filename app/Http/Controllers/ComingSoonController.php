<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ComingSoonController extends Controller
{
    public function emails(\App\Models\Workspace $workspace): Response
    {
        return $this->page(
            title: 'Emails',
            description: 'Send and track workspace email from one inbox.',
            icon: 'mail',
        );
    }

    public function billing(\App\Models\Workspace $workspace): Response
    {
        return $this->page(
            title: 'Billing',
            description: 'Manage your plan, invoices, and payment methods.',
            icon: 'credit-card',
        );
    }

    public function archive(\App\Models\Workspace $workspace): Response
    {
        return $this->page(
            title: 'Archive',
            description: 'Find archived projects and restore them when you need them again.',
            icon: 'archive',
        );
    }

    private function page(string $title, string $description, string $icon): Response
    {
        return Inertia::render('coming-soon', [
            'title' => $title,
            'description' => $description,
            'icon' => $icon,
        ]);
    }
}
