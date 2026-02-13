# Release Management

Releases are automated via the shared release script and GitHub Actions.

## Release Process

### 1. Prepare Changelog

Update `CHANGELOG.md` with a new version section:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New feature descriptions

### Changed
- Changes to existing features

### Fixed
- Bug fixes
```

Commit and push this to `main` (via PR).

### 2. Run the Release Script

From the plans repo root:

```bash
# Preview what will happen
./scripts/release.sh app vX.Y.Z --dry-run

# Execute the release
./scripts/release.sh app vX.Y.Z
```

The script will:
1. Verify clean working tree on `main`
2. Extract release notes from `CHANGELOG.md`
3. Bump version in `package.json`, `src-tauri/tauri.conf.json`, and `src-tauri/Cargo.toml`
4. Commit and push to `main`
5. Create a GitHub Release with the changelog as release notes

### 3. CI Builds Artifacts

The `deploy.yml` workflow triggers automatically on the release and:
- Builds for macOS (arm64 + x86_64), Linux, and Windows
- Signs update artifacts with the Tauri updater signing key
- Attaches all binaries (.dmg, .AppImage, .msi), signatures (.sig), and `latest.json` to the GitHub Release

### 4. Users Get the Update

Desktop users with an existing install will see an in-app toast notification on their next launch, with options to install immediately or dismiss.

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR (X)**: Breaking changes
- **MINOR (Y)**: New features, backward compatible
- **PATCH (Z)**: Bug fixes, minor improvements

## Version Files

The version lives in 3 files that must stay in sync. **Never edit these manually** — the release script handles all three:
- `package.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`

## Required GitHub Secrets

- `TAURI_SIGNING_PRIVATE_KEY` — Tauri updater signing private key
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — Private key password (if set)

## Hotfix Process

For critical bugs in production:

1. Fix the bug on a branch, merge to `main` via PR
2. Update `CHANGELOG.md` with the patch version
3. Run the release script: `./scripts/release.sh app vX.Y.Z`

## Store Submission (Future)

Store submissions (Mac App Store, Microsoft Store) are deferred. Currently distributing via GitHub Releases (direct download) only.
