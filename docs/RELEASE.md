# Release Process (npm)

This repository is a pnpm workspace monorepo.

- The workspace root package is **private** and is **not** published.
- The publishable packages live under `packages/`:
  - `@themed.js/core`
  - `@themed.js/react`
  - `@themed.js/vue`

Releases are managed with **Changesets**.

## Prerequisites

- Node.js 20+ and pnpm (see `package.json#engines` and `package.json#packageManager`).
- npm account with publish access to the `@themed.js/*` scope.
- If using GitHub Actions publishing: set the repository secret `NPM_TOKEN`.
  - The token must have permission to publish to npm.
  - If your npm account uses 2FA for publishing, use an automation token.

## Normal Flow (Recommended): PR-driven + GitHub Actions

### 1) In your feature PR

After making changes that should ship, add a changeset:

```bash
pnpm changeset
```

- Select the packages that should be bumped.
- Choose the bump type (patch/minor/major).
- Write a short summary (this becomes the changelog entry).

Commit the generated file in `.changeset/` as part of the PR.

### 2) Merge to `main`

When changesets are present on `main`, the release workflow will:

- Create a "Version Packages" PR that:
  - Applies version bumps
  - Updates package changelogs

### 3) Merge the "Version Packages" PR

After merging that PR, the workflow will publish updated packages to npm.

## Manual Flow: Release from your machine

Use this if you don’t want CI to publish, or if you are doing a one-off release.

### 1) Ensure the repo is healthy

```bash
pnpm test:run
pnpm build:packages
```

### 2) Confirm what will be released

```bash
pnpm changeset:status
```

If it prints something like:

- `Running release would release NO packages ...`

that means there are **no pending changesets** (no `.changeset/*.md` files describing version bumps).
Create one with:

```bash
pnpm changeset
```

Then commit the generated file under `.changeset/` and re-run `pnpm changeset:status`.

### 3) Apply versions + changelogs

```bash
pnpm changeset:version
```

Commit the version/changelog updates.

### 4) Publish

Either export an npm token (recommended for automation):

```bash
export NPM_TOKEN=***
```

Or authenticate via `npm login`.

Then publish:

```bash
pnpm release
```

Notes:

- `pnpm release` runs tests and builds packages before publishing.
- Changesets will only publish packages that have version bumps.

## Troubleshooting

### "version X.Y.Z is already published" / "No unpublished projects to publish"

Example output:

- `warn @themed.js/core is not being published because version 0.1.0 is already published on npm`
- `warn No unpublished projects to publish`

This means your local `packages/*/package.json` versions are **not newer** than what is already on npm.
npm does not allow re-publishing the same version.

Fix:

1. Create a changeset describing the release:

```bash
pnpm changeset
```

2. Apply version bumps + update changelogs:

```bash
pnpm changeset:version
```

3. Commit the version/changelog updates.

4. Publish again:

```bash
pnpm release
```

Sanity-check what npm currently has:

```bash
npm view @themed.js/core version
npm view @themed.js/react version
npm view @themed.js/vue version
```

### E401: "Unable to authenticate" (invalid token)

If publishing fails with:

- `npm error code E401`
- `Unable to authenticate, your authentication token seems to be invalid.`

You are not authenticated to npm (or your token is expired/invalid).

Fix (local machine):

1. Verify the registry is correct:

```bash
npm config get registry
```

It should be `https://registry.npmjs.org/`.

2. Check you are logged in:

```bash
npm whoami
```

If it errors, log in again:

```bash
npm login
```

Fix (CI / automation):

- Set `NPM_TOKEN` in your CI secrets.
- Prefer an **Automation** token if your account has 2FA enabled for publishing.

### E404 while publishing a scoped package (often permissions)

If you see errors like:

- `E404 Not Found - PUT https://registry.npmjs.org/@themed.js%2fcore - Not found`

This frequently means **you do not have permission** to publish to that package or scope.
npm may respond with 404 for unauthorized access.

Checklist:

- Confirm you are logged in as the expected user: `npm whoami`
- Confirm you have publish rights for the `@themed.js` scope (organization membership / package collaborators).
- Ensure the token used has publish permission (and is not read-only).

Helpful commands:

```bash
npm access ls-collaborators @themed.js/core
```

If the package does not exist yet (first publish), ensure publishing is public:

- Changesets is configured with `access: "public"` in `.changeset/config.json`.
- If publishing manually without Changesets, you would need `npm publish --access public`.

## Post-release Checks

- Confirm versions on npm:

```bash
npm view @themed.js/core version
npm view @themed.js/react version
npm view @themed.js/vue version
```

- Sanity-check installation in a clean project:

```bash
pnpm add @themed.js/core @themed.js/react
```

## Configuration Notes

- Changesets config is in `.changeset/config.json`.
- `access` is set to `public` so scoped packages publish correctly.
