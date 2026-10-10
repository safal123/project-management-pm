# CI and Laravel Cloud deployment

`.github/workflows/ci.yml` runs on pull requests, merge queues, pushes to `main` / `develop`, and manual dispatches. It checks ESLint, Prettier, TypeScript, the Vite production build, PHP formatting, and the Pest suite. CI never rewrites source files. Tests use an isolated SQLite in-memory database and a generated application key; no production credentials are needed.

## Enable the merge gate

1. Commit and push this workflow and let it run on a pull request.
2. In GitHub Settings → Rules → Rulesets (or branch protection), protect `main` and `develop`.
3. Require pull requests and the **Merge checks** status check. Require branches to be up to date, or enable a merge queue. Remove obsolete `quality` / `ci` check requirements if previously configured.

The workflow alone does not prevent merging; the required-check rule does. `Merge checks` fails if any prerequisite fails, is cancelled, or is skipped.

## Connect Laravel Cloud

1. Configure the production Cloud environment to deploy this repository's `main` branch.
2. In Cloud Settings → Deployments, disable **Push to deploy**, so Cloud does not deploy before CI passes.
3. Enable **Deploy hook** and copy its URL.
4. In GitHub Settings → Environments, create `production`. Restrict deployment branches to `main` and add the environment secret **LARAVEL_CLOUD_DEPLOY_HOOK**. Store the URL there, not in source code or chat.
5. Keep Cloud's PHP runtime compatible with this project (CI uses PHP 8.4). Configure Cloud build commands to install Composer production dependencies and run `npm ci` followed by `npm run build`. Configure your database and other runtime environment variables in Cloud; use `php artisan migrate --force` as the deployment command when ready to run production migrations.

Only a successful push pipeline on `main` requests deployment. Pull requests, `develop`, merge queues, and manual CI runs do not deploy. The hook receives the tested commit SHA, so a newer branch tip cannot be deployed accidentally. The hook job confirms that Cloud accepted the request; it does not wait for or certify a successful Cloud release. Check deployment completion in Laravel Cloud.

## Local checks

```sh
npm ci
npm run lint:check
npm run format:check
npm run types
npm run build
vendor/bin/pint --test
APP_ENV=testing DB_CONNECTION=sqlite DB_DATABASE=:memory: vendor/bin/pest --compact
```

Existing lint, formatting, and TypeScript errors must be fixed before the merge gate will pass. Do not bypass them with `continue-on-error`.

References: [Laravel Cloud deploy hooks](https://laravel.com/cloud/docs/deployments#deploy-hooks), [GitHub required checks and merge queues](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks).
