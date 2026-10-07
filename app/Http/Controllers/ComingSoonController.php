<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ComingSoonController extends Controller
{
    public function people(): Response
    {
        return $this->page(
            title: 'People',
            description: 'Invite teammates and manage who has access to this workspace.',
            icon: 'users',
        );
    }

    public function activity(): Response
    {
        return $this->page(
            title: 'Activities',
            description: 'Follow workspace activity across projects, tasks, and comments.',
            icon: 'clock',
        );
    }

    public function emails(): Response
    {
        return $this->page(
            title: 'Emails',
            description: 'Send and track workspace email from one inbox.',
            icon: 'mail',
        );
    }

    public function billing(): Response
    {
        return $this->page(
            title: 'Billing',
            description: 'Manage your plan, invoices, and payment methods.',
            icon: 'credit-card',
        );
    }

    public function archive(): Response
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
