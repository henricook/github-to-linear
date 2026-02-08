# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Browser extension (Chrome + Firefox) that adds Linear integration to GitHub. Shows linked Linear issues on GitHub issue/PR pages and lists, and provides "Add to Linear" buttons. Fork of `delucis/github-to-linear` - upstream is unmaintained.

## Commands

```sh
pnpm install              # Install dependencies
pnpm build                # Build for Firefox (MV2) -> dist/
pnpm build:chrome         # Build for Chrome (MV3) -> dist/
pnpm changeset            # Add release notes for changes
```

No tests or linting exist in this project.

Dev mode (`pnpm dev` / `pnpm dev:chrome`) opens a temp browser with the extension loaded - the human operator runs this, not Claude.

## Architecture

Plain JavaScript, no build step for source code. The build script (`scripts/build.mjs`) just copies `extension/` to `dist/` and patches `manifest.json` (sets version from package.json, converts MV2 to MV3 for Chrome).

### Extension Components

- **Content script** (`extension/scripts/content.js`) - Runs on GitHub pages. Parses URLs, detects issue/PR pages, injects Linear UI (sidebar cards, list links, "Add to Linear" buttons). Uses hyperscript-style `h()` and `s()` helper functions for DOM creation. Listens for GitHub's `turbo:render` event to handle SPA navigation.

- **Background script** (`extension/scripts/background.js`) - Bridges content script to Linear GraphQL API. Receives `{ linearQuery }` messages, POSTs to `https://api.linear.app/graphql`, returns results. Has a 30-second query cache.

- **Options page** (`extension/options/`) - Settings UI for Linear API key, default team, and default assignee. Note: duplicates some Linear API functions from background.js (acknowledged tech debt).

### Key Technical Details

- Source manifest is MV2; build script transforms to MV3 for Chrome (background scripts -> service_worker, removes chrome_style)
- GraphQL queries to Linear API are constructed via string interpolation (not parameterized variables)
- API key stored in `chrome.storage.local`
- Issue search uses Linear's `issues` GraphQL endpoint with filters matching by GitHub URL and `org/repo#number` identifier

### Known Issues (from upstream)

- The upstream extension used the deprecated `issueSearch` GraphQL endpoint - this fork uses the replacement `issues` endpoint (fix from unmerged upstream PR #38)
- Options page has potential XSS via `innerHTML` when rendering Linear API profile data

## Release Process

Uses [Changesets](https://github.com/changesets/changesets/). On push to `latest` branch, GitHub Actions creates a "Version Packages" PR. Merging that PR triggers automatic publishing to Chrome Web Store and Firefox Add-ons. CI workflows are in `.github/workflows/`.

## Git

- Push exceptions: git push is allowed on this project (special exception)
- Upstream remote: `https://github.com/delucis/github-to-linear.git`
- Origin remote: `git@github.com:henricook/github-to-linear.git`
- Main branch: `latest`
