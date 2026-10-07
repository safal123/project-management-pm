<?php

namespace App\Services\Git;

interface GitProvider
{
    /**
     * Verify access to a repository and return its details.
     *
     * @return array{full_name: string, html_url: string, default_branch: string, private: bool}
     *
     * @throws GitProviderException
     */
    public function getRepository(string $token, string $fullName): array;

    /**
     * Create a new branch in the given repository from an existing base branch.
     *
     * @return array{name: string, url: string}
     *
     * @throws GitProviderException
     */
    public function createBranch(string $token, string $fullName, string $branchName, string $fromBranch): array;
}
