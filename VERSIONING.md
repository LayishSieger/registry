# Versioning

This repo uses [Changesets](https://github.com/changesets/changesets) for a **single package version** (`package.json`), root `CHANGELOG.md`, and **GitHub Releases** (git tags like `v0.2.0`). Nothing is published to npm — this is a file registry.

## When you need a changeset

Add a changeset (`pnpm changeset`) on any PR that changes:

- `registry.json`
- files under `registry/` (component source)

Docs, README, CI, and app-only changes do not require one. CI fails registry PRs that omit a changeset.

Prefer scoping each PR to `registry.json` plus **one** component’s files so the changelog stays clear.

## Choosing the bump

| Bump | Use when |
| --- | --- |
| **patch** | Bug fixes with no intentional behavior change |
| **minor** | New components, or additive non-breaking props/variants |
| **major** | Breaking API, path, or removed export |

### Breaking changes and `shadcn add`

`npx shadcn add` **copies** files into the consumer project. Existing local copies are unchanged until someone re-runs add (which can overwrite). Call that out in the changeset summary when a change is breaking for re-add / fresh installs, e.g.:

> Breaking for consumers who re-run `shadcn add` (overwrites local copies): renamed `onResult` → `onComplete`.

## Workflow

1. On your feature PR: `pnpm changeset` → pick patch/minor/major → write a short summary → commit the new `.changeset/*.md` file.
2. Merge to `main`. The **Release** workflow opens or updates a **Version Packages** PR (version bump + changelog).
3. Merge **Version Packages**. That creates a GitHub Release and tag (`vX.Y.Z`).

No extra secrets: `GITHUB_TOKEN` (default Actions token) is enough for the Version Packages PR and GitHub Releases. The release job needs `contents: write` and `pull-requests: write`; the changeset status check only needs `contents: read`.
