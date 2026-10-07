<?php

namespace App\Services\Git;

use App\Models\ProjectIntegration;

class GitProviderManager
{
    public function driver(string $provider): GitProvider
    {
        return match ($provider) {
            ProjectIntegration::PROVIDER_GITHUB => new GitHubProvider,
            'gitlab', 'bitbucket' => throw new GitProviderException(ucfirst($provider).' is not supported yet.'),
            default => throw new GitProviderException("Unknown git provider \"{$provider}\"."),
        };
    }
}
