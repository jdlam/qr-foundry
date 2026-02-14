#!/usr/bin/env bash
set -euo pipefail

# Shared release script for QR Foundry services.
# Lives in the plans repo and operates on sibling service repos.
#
# Usage:
#   ./scripts/release.sh <service|all> <version> [--dry-run]
#   ./scripts/release.sh --list
#   ./scripts/release.sh --help

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

DRY_RUN=false
VERBOSE=false

usage() {
  cat <<EOF
Usage: ./scripts/release.sh <service|all> <version> [--dry-run]

Services:
  api       qr-foundry-api/
  worker    qr-foundry-worker/
  site      qr-foundry-site/
  app       qr-foundry-app/
  all       Release all services that have a matching changelog section

Options:
  --list [-v] Show the latest version for each service (-v for date, package.json version, commits since)
  --dry-run   Show what would happen without committing, pushing, or creating a release
  --help      Show this help message

Examples:
  ./scripts/release.sh --list
  ./scripts/release.sh --list -v
  ./scripts/release.sh api v0.2.0
  ./scripts/release.sh all v0.2.0 --dry-run
EOF
  exit 0
}

# Get the version field from package.json
pkg_version() {
  local pkg_file="$1"
  if [[ ! -f "$pkg_file" ]]; then
    echo "-"
    return
  fi
  node -e "console.log(JSON.parse(require('fs').readFileSync('$pkg_file','utf8')).version || '-')"
}

# Count commits on main since a given tag
commits_since_tag() {
  local repo_path="$1"
  local tag="$2"
  # Check if the tag exists in this repo
  if git -C "$repo_path" rev-parse "$tag" >/dev/null 2>&1; then
    git -C "$repo_path" rev-list "$tag"..HEAD --count 2>/dev/null
  else
    echo "-"
  fi
}

list_versions() {
  local dir changelog _ver _date
  for svc in $ALL_SERVICES; do
    dir="$(service_dir "$svc")"
    changelog="$ROOT_DIR/$dir/CHANGELOG.md"
    if parse_latest_release "$changelog"; then
      if $VERBOSE; then
        local pkg_ver commits date_str
        pkg_ver="$(pkg_version "$ROOT_DIR/$dir/package.json")"
        commits="$(commits_since_tag "$ROOT_DIR/$dir" "v$_ver")"
        date_str="${_date:-(no date)}"
        printf "  %-8s v%-10s  %s  pkg=%s  commits_since=%s\n" "$svc" "$_ver" "$date_str" "$pkg_ver" "$commits"
      else
        printf "  %-8s v%s\n" "$svc" "$_ver"
      fi
    else
      if [[ ! -f "$changelog" ]]; then
        printf "  %-8s (no CHANGELOG.md)\n" "$svc"
      else
        printf "  %-8s (no releases)\n" "$svc"
      fi
    fi
  done
}

# Bump version in tauri.conf.json and Cargo.toml (app-specific)
bump_app_versions() {
  local repo_path="$1"
  local version_num="$2"

  # Update src-tauri/tauri.conf.json
  local tauri_conf="$repo_path/src-tauri/tauri.conf.json"
  if [[ -f "$tauri_conf" ]]; then
    if $DRY_RUN; then
      info "[app] (dry-run) Would update tauri.conf.json version to $version_num"
    else
      node -e "
        const fs = require('fs');
        const p = '$tauri_conf';
        const conf = JSON.parse(fs.readFileSync(p, 'utf8'));
        conf.version = '$version_num';
        fs.writeFileSync(p, JSON.stringify(conf, null, 2) + '\n');
      "
      info "[app] Updated tauri.conf.json version to $version_num"
    fi
  fi

  # Update src-tauri/Cargo.toml (version under [package])
  local cargo_toml="$repo_path/src-tauri/Cargo.toml"
  if [[ -f "$cargo_toml" ]]; then
    if $DRY_RUN; then
      info "[app] (dry-run) Would update Cargo.toml version to $version_num"
    else
      sed -i.bak '/^\[package\]/,/^\[/{s/^version = ".*"/version = "'"$version_num"'"/;}' "$cargo_toml"
      rm -f "$cargo_toml.bak"
      info "[app] Updated Cargo.toml version to $version_num"
    fi
  fi
}

# Release a single service
release_service() {
  local service="$1"
  local version="$2"     # e.g. v0.2.0
  local version_num="${version#v}"  # e.g. 0.2.0
  local skip_on_missing="$3"  # "true" when called from "all"

  local dir
  dir="$(service_dir "$service")" || die "Unknown service: $service"
  local repo_path="$ROOT_DIR/$dir"

  if [[ ! -d "$repo_path" ]]; then
    die "Service directory not found: $repo_path"
  fi

  info "[$service] Checking $dir..."

  # Check for clean working tree
  if [[ -n "$(git -C "$repo_path" status --porcelain)" ]]; then
    die "[$service] Working tree is dirty. Commit or stash changes first."
  fi

  # Check we're on main
  local branch
  branch="$(git -C "$repo_path" rev-parse --abbrev-ref HEAD)"
  if [[ "$branch" != "main" ]]; then
    die "[$service] Not on main branch (currently on '$branch')."
  fi

  # Check changelog has a section for this version
  local changelog="$repo_path/CHANGELOG.md"
  local notes
  if ! notes="$(extract_changelog "$changelog" "$version_num")"; then
    if [[ "$skip_on_missing" == "true" ]]; then
      warn "[$service] No changelog section for $version_num — skipping."
      return 0
    else
      die "[$service] No ## [$version_num] section found in CHANGELOG.md"
    fi
  fi

  # Trim leading/trailing blank lines (macOS sed compatible)
  notes="$(echo "$notes" | awk 'NF{found=1} found' | awk '{lines[NR]=$0} END{for(i=NR;i>=1;i--) if(lines[i]!=""){last=i;break} for(i=1;i<=last;i++) print lines[i]}')"

  if [[ -z "$notes" ]]; then
    if [[ "$skip_on_missing" == "true" ]]; then
      warn "[$service] Changelog section for $version_num is empty — skipping."
      return 0
    else
      die "[$service] Changelog section for $version_num is empty."
    fi
  fi

  info "[$service] Release notes for $version_num:"
  echo "$notes"
  echo ""

  # Update package.json version
  if [[ -f "$repo_path/package.json" ]]; then
    if $DRY_RUN; then
      info "[$service] (dry-run) Would update package.json version to $version_num"
    else
      node -e "
        const fs = require('fs');
        const p = '$repo_path/package.json';
        const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
        pkg.version = '$version_num';
        fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
      "
      info "[$service] Updated package.json version to $version_num"
    fi
  fi

  # App-specific: also bump tauri.conf.json and Cargo.toml
  if [[ "$service" == "app" ]]; then
    bump_app_versions "$repo_path" "$version_num"
  fi

  # Commit (skip if versions were already correct)
  if $DRY_RUN; then
    info "[$service] (dry-run) Would commit: chore: release $version"
  else
    git -C "$repo_path" add -A
    if [[ -n "$(git -C "$repo_path" diff --cached --name-only)" ]]; then
      git -C "$repo_path" commit -m "chore: release $version"
      info "[$service] Committed: chore: release $version"
    else
      info "[$service] Version files already up to date — skipping commit."
    fi
  fi

  # Push
  if $DRY_RUN; then
    info "[$service] (dry-run) Would push to main"
  else
    git -C "$repo_path" push origin main
    info "[$service] Pushed to main"
  fi

  # Create GitHub Release
  if $DRY_RUN; then
    info "[$service] (dry-run) Would create GitHub Release $version"
  else
    local url
    url="$(gh release create "$version" \
      --repo "jdlam/$dir" \
      --title "$version" \
      --notes "$notes" \
      --target main)"
    info "[$service] Release created: $url"
  fi
}

# --- Argument parsing ---

if [[ $# -lt 1 ]]; then
  usage
fi

# Check for --help, --list, and --verbose/-v anywhere in args
LIST=false
for arg in "$@"; do
  if [[ "$arg" == "--help" || "$arg" == "-h" ]]; then
    usage
  fi
  if [[ "$arg" == "--list" || "$arg" == "-l" ]]; then
    LIST=true
  fi
  if [[ "$arg" == "--verbose" || "$arg" == "-v" ]]; then
    VERBOSE=true
  fi
done

if $LIST; then
  list_versions
  exit 0
fi

SERVICE="$1"
VERSION="${2:-}"

# Check for --dry-run
for arg in "$@"; do
  if [[ "$arg" == "--dry-run" ]]; then
    DRY_RUN=true
  fi
done

if [[ -z "$VERSION" ]]; then
  die "Version is required. Usage: ./scripts/release.sh <service|all> <version>"
fi

# Validate version format
validate_version "$VERSION"

if [[ "$SERVICE" == "all" ]]; then
  for svc in $ALL_SERVICES; do
    release_service "$svc" "$VERSION" "true"
  done
elif service_dir "$SERVICE" > /dev/null 2>&1; then
  release_service "$SERVICE" "$VERSION" "false"
else
  die "Unknown service: $SERVICE. Valid services: api, worker, site, app, all"
fi

info "Done."
