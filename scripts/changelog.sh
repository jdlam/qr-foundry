#!/usr/bin/env bash
set -euo pipefail

# Generate a changelog section from conventional commits and insert it
# into a service's CHANGELOG.md.
#
# Usage:
#   ./scripts/changelog.sh <service> <version>           # generate, edit, commit
#   ./scripts/changelog.sh <service> <version> --dry-run  # preview only
#   ./scripts/changelog.sh --help

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib.sh"

DRY_RUN=false

usage() {
  cat <<EOF
Usage: ./scripts/changelog.sh <service> <version> [--dry-run]

Generate a changelog section from conventional commits since the last
release tag, insert it into CHANGELOG.md, open \$EDITOR for review,
and commit.

Services:
  api       qr-foundry-api/
  worker    qr-foundry-worker/
  site      qr-foundry-site/
  app       qr-foundry-app/

Options:
  --dry-run   Print generated notes without writing or committing
  --help      Show this help message

Examples:
  ./scripts/changelog.sh worker v0.1.0 --dry-run
  ./scripts/changelog.sh worker v0.1.0
  ./scripts/changelog.sh api v0.2.0
EOF
  exit 0
}

# Classify a conventional commit subject into a Keep a Changelog category.
# Returns the category name or empty string to skip.
classify_commit() {
  local subject="$1"
  case "$subject" in
    feat:*|feat\(*) echo "Added" ;;
    fix:*|fix\(*)   echo "Fixed" ;;
    refactor:*|refactor\(*) echo "Changed" ;;
    *)              echo "" ;; # skip chore, docs, test, ci, unknown
  esac
}

# Strip the conventional commit prefix, returning just the description.
strip_prefix() {
  local subject="$1"
  # Remove "type:" or "type(scope):" prefix
  echo "$subject" | sed -E 's/^[a-z]+(\([^)]*\))?:[[:space:]]*//'
}

# Generate changelog notes from git commits.
# Outputs the markdown body (### Added, ### Fixed, ### Changed sections).
generate_notes() {
  local repo_path="$1"
  local since_ref="$2" # tag or empty for all commits

  local log_args=(--oneline --no-merges --format='%s')
  if [[ -n "$since_ref" ]]; then
    log_args+=("${since_ref}..HEAD")
  fi

  local added=() fixed=() changed=()

  while IFS= read -r subject; do
    [[ -z "$subject" ]] && continue
    # Skip release commits
    if [[ "$subject" == chore:\ release\ * ]]; then
      continue
    fi
    local category
    category="$(classify_commit "$subject")"
    [[ -z "$category" ]] && continue
    local desc
    desc="$(strip_prefix "$subject")"
    # Capitalize first letter (bash 3 compatible)
    local first="${desc:0:1}"
    local rest="${desc:1}"
    first="$(echo "$first" | tr '[:lower:]' '[:upper:]')"
    desc="${first}${rest}"
    case "$category" in
      Added)   added+=("$desc") ;;
      Fixed)   fixed+=("$desc") ;;
      Changed) changed+=("$desc") ;;
    esac
  done < <(git -C "$repo_path" log "${log_args[@]}" 2>/dev/null)

  local output=""
  if [[ ${#added[@]} -gt 0 ]]; then
    output+=$'\n### Added\n'
    for item in "${added[@]}"; do
      output+="- $item"$'\n'
    done
  fi
  if [[ ${#fixed[@]} -gt 0 ]]; then
    output+=$'\n### Fixed\n'
    for item in "${fixed[@]}"; do
      output+="- $item"$'\n'
    done
  fi
  if [[ ${#changed[@]} -gt 0 ]]; then
    output+=$'\n### Changed\n'
    for item in "${changed[@]}"; do
      output+="- $item"$'\n'
    done
  fi

  echo "$output"
}

# Insert a new version section into CHANGELOG.md after ## [Unreleased].
insert_section() {
  local changelog_file="$1"
  local version_num="$2"
  local date="$3"
  local notes="$4"
  local dir="$5"

  local header="## [$version_num] - $date"
  local link_ref="[$version_num]: https://github.com/jdlam/$dir/releases/tag/v$version_num"

  # Build the section to insert
  local section
  section="$header"
  if [[ -n "$notes" ]]; then
    section+="$notes"
  fi

  # Insert after the ## [Unreleased] line (with a blank line separator)
  awk -v section="$section" '
    /^## \[Unreleased\]/ {
      print $0
      print ""
      print section
      next
    }
    { print }
  ' "$changelog_file" > "$changelog_file.tmp"

  # Append link reference at the end of file
  # Check if file ends with a newline
  if [[ -s "$changelog_file.tmp" ]] && [[ "$(tail -c 1 "$changelog_file.tmp")" != "" ]]; then
    echo "" >> "$changelog_file.tmp"
  fi
  echo "$link_ref" >> "$changelog_file.tmp"

  mv "$changelog_file.tmp" "$changelog_file"
}

# --- Argument parsing ---

if [[ $# -lt 1 ]]; then
  usage
fi

for arg in "$@"; do
  if [[ "$arg" == "--help" || "$arg" == "-h" ]]; then
    usage
  fi
  if [[ "$arg" == "--dry-run" ]]; then
    DRY_RUN=true
  fi
done

SERVICE="$1"
VERSION="${2:-}"

if [[ -z "$VERSION" ]]; then
  die "Version is required. Usage: ./scripts/changelog.sh <service> <version>"
fi

validate_version "$VERSION"

VERSION_NUM="${VERSION#v}"

# Resolve service directory
DIR="$(service_dir "$SERVICE")" || die "Unknown service: $SERVICE. Valid services: api, worker, site, app"
REPO_PATH="$ROOT_DIR/$DIR"

if [[ ! -d "$REPO_PATH" ]]; then
  die "Service directory not found: $REPO_PATH"
fi

CHANGELOG="$REPO_PATH/CHANGELOG.md"

if [[ ! -f "$CHANGELOG" ]]; then
  die "CHANGELOG.md not found at $CHANGELOG"
fi

# Check that section does NOT already exist
if grep -q "^## \[$VERSION_NUM\]" "$CHANGELOG"; then
  die "Section ## [$VERSION_NUM] already exists in CHANGELOG.md. Edit manually or delete it first."
fi

if ! $DRY_RUN; then
  # Check for clean working tree
  if [[ -n "$(git -C "$REPO_PATH" status --porcelain)" ]]; then
    die "[$SERVICE] Working tree is dirty. Commit or stash changes first."
  fi

  # Check we're on main
  BRANCH="$(git -C "$REPO_PATH" rev-parse --abbrev-ref HEAD)"
  if [[ "$BRANCH" != "main" ]]; then
    die "[$SERVICE] Not on main branch (currently on '$BRANCH')."
  fi
fi

# Find last release tag
SINCE_REF=""
local_ver="" _ver="" _date=""
if parse_latest_release "$CHANGELOG"; then
  local_ver="$_ver"
  TAG="v$local_ver"
  # Verify the tag exists in the repo
  if git -C "$REPO_PATH" rev-parse "$TAG" >/dev/null 2>&1; then
    SINCE_REF="$TAG"
    info "Generating changelog since $TAG..."
  else
    info "Tag $TAG not found in repo — using all commits."
  fi
else
  info "No prior release found — using all commits."
fi

# Generate notes from commits
TODAY="$(date +%Y-%m-%d)"
NOTES="$(generate_notes "$REPO_PATH" "$SINCE_REF")"

if $DRY_RUN; then
  echo ""
  echo "## [$VERSION_NUM] - $TODAY"
  if [[ -n "$NOTES" ]]; then
    echo "$NOTES"
  else
    echo ""
    echo "(no categorizable commits found — section will be empty)"
  fi
  echo ""
  echo "[$VERSION_NUM]: https://github.com/jdlam/$DIR/releases/tag/v$VERSION_NUM"
  exit 0
fi

# Insert section into CHANGELOG.md
insert_section "$CHANGELOG" "$VERSION_NUM" "$TODAY" "$NOTES" "$DIR"
info "Inserted ## [$VERSION_NUM] section into CHANGELOG.md"

# Open editor for review
EDITOR="${EDITOR:-vi}"
info "Opening $EDITOR for review..."
"$EDITOR" "$CHANGELOG"

# Verify section still exists after editing
if ! grep -q "^## \[$VERSION_NUM\]" "$CHANGELOG"; then
  die "Section ## [$VERSION_NUM] was removed during editing. Aborting."
fi

# Stage and commit
git -C "$REPO_PATH" add CHANGELOG.md
git -C "$REPO_PATH" commit -m "docs: add changelog for v$VERSION_NUM"
info "Committed: docs: add changelog for v$VERSION_NUM"
info "Done. Run ./scripts/release.sh $SERVICE $VERSION to release."
