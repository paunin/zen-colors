---
name: release-workflow
description: >-
  Commit, tag, version-bump, and push workflows for this repo. Use when the user
  says "tcp" (tag-commit-push with version bump) or "cp" (commit-push without
  version bump). Handles package.json version, git tags, signed commits, and push.
---

# Release Workflow

Two shorthand commands for committing and shipping changes.

## cp -- Commit and Push

Triggered when the user says **"cp"**.

Steps:

1. `git add -A`
2. `git status` -- verify staged changes look correct.
3. `git diff --cached --stat` -- summarise what changed.
4. Compose a concise commit message from the diff (imperative mood, 1-2 sentences).
5. `git commit -S -m "<message>"` (GPG-signed).
6. `git push`

Do **not** bump the version or create a tag.

## tcp -- Tag, version bump, Commit and Push

Triggered when the user says **"tcp"**.

Steps:

1. Read current `version` from `package.json`.
2. Ask the user which semver bump to apply (patch / minor / major) using the AskQuestion tool. Default suggestion: **patch**.
3. Bump the version:
   - Update `"version"` in `package.json` (do **not** use `npm version` -- edit the file directly to avoid extra git operations).
   - Run `npm install --package-lock-only` to sync `package-lock.json`.
4. `git add -A`
5. `git diff --cached --stat` -- summarise what changed.
6. Compose a concise commit message that includes the new version, e.g. `Release v1.2.3 -- <summary>`.
7. `git commit -S -m "<message>"` (GPG-signed).
8. `git tag -s v<new-version> -m "v<new-version>"` (signed tag).
9. `git push && git push --tags`

## Rules

- Always use signed commits (`-S`) and signed tags (`-s`).
- Never amend commits that have already been pushed.
- If GPG signing fails (pinentry cancelled), inform the user and retry once; do not fall back to unsigned.
- Commit messages should describe **why**, not just **what**.
- Never commit files that look like secrets (`.env`, credentials, tokens).
