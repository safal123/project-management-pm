<?php

namespace Database\Factories;

use App\Models\ProjectIntegration;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ProjectIntegration>
 */
class ProjectIntegrationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'provider' => ProjectIntegration::PROVIDER_GITHUB,
            'repo_full_name' => 'acme/'.Str::slug($this->faker->word()),
            'repo_url' => 'https://github.com/acme/repo',
            'default_branch' => 'main',
            'access_token' => 'ghp_'.Str::random(36),
        ];
    }
}
