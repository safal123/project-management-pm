<?php

namespace App\Services\Git;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;

class GitHubProvider implements GitProvider
{
    protected const BASE_URL = 'https://api.github.com';

    public function getRepository(string $token, string $fullName): array
    {
        $response = $this->client($token)->get("/repos/{$fullName}");

        if ($response->status() === 404) {
            throw new GitProviderException('Repository not found or the token does not have access to it.');
        }

        if ($response->status() === 401) {
            throw new GitProviderException('GitHub rejected the provided access token.');
        }

        if ($response->failed()) {
            throw new GitProviderException('Unable to reach GitHub. Please try again.');
        }

        $data = $response->json();

        return [
            'full_name' => $data['full_name'],
            'html_url' => $data['html_url'],
            'default_branch' => $data['default_branch'],
            'private' => $data['private'],
        ];
    }

    public function createBranch(string $token, string $fullName, string $branchName, string $fromBranch): array
    {
        $client = $this->client($token);

        $refResponse = $client->get("/repos/{$fullName}/git/ref/heads/{$fromBranch}");

        if ($refResponse->status() === 404) {
            throw new GitProviderException("Base branch \"{$fromBranch}\" was not found in the repository.");
        }

        if ($refResponse->failed()) {
            throw new GitProviderException('Unable to look up the base branch on GitHub.');
        }

        $baseSha = $refResponse->json('object.sha');

        $createResponse = $client->post("/repos/{$fullName}/git/refs", [
            'ref' => "refs/heads/{$branchName}",
            'sha' => $baseSha,
        ]);

        if ($createResponse->status() === 422) {
            throw new GitProviderException("Branch \"{$branchName}\" already exists in the repository.");
        }

        if ($createResponse->failed()) {
            throw new GitProviderException('GitHub rejected the branch creation request.');
        }

        return [
            'name' => $branchName,
            'url' => "https://github.com/{$fullName}/tree/{$branchName}",
        ];
    }

    protected function client(string $token): PendingRequest
    {
        return Http::baseUrl(self::BASE_URL)
            ->withToken($token)
            ->acceptJson()
            ->withHeaders([
                'X-GitHub-Api-Version' => '2022-11-28',
            ]);
    }
}
