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
