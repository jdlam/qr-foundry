#!/usr/bin/env bash
# Shared utilities for QR Foundry release scripts.
# Source this file — do not execute directly.

# Resolve paths relative to the repo root
LIB_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$LIB_SCRIPT_DIR/.." && pwd)"

# Service name → directory mapping (bash 3 compatible)
service_dir() {
  case "$1" in
    api)    echo "qr-foundry-api" ;;
    worker) echo "qr-foundry-worker" ;;
    site)   echo "qr-foundry-site" ;;
    app)    echo "qr-foundry-app" ;;
    *)      return 1 ;;
  esac
}

ALL_SERVICES="api worker site app"

die() {
  echo "Error: $1" >&2
  exit 1
}

info() {
  echo "==> $1"
}

warn() {
  echo "Warning: $1" >&2
}

# Version format regex (vX.Y.Z)
VERSION_REGEX='^v[0-9]+\.[0-9]+\.[0-9]+$'

# Validate version format. Dies on invalid input.
validate_version() {
  local version="$1"
  if [[ ! "$version" =~ $VERSION_REGEX ]]; then
    die "Version must start with 'v' and follow semver (e.g. v0.2.0). Got: $version"
  fi
}

# Parse the latest released version and date from CHANGELOG.md.
# Sets _ver and _date variables (caller must declare them with local).
parse_latest_release() {
  local changelog_file="$1"
  _ver=""
  _date=""
  if [[ ! -f "$changelog_file" ]]; then
    return 1
  fi
  local line
  line="$(awk '
    /^## \[/ {
      s = $0
      gsub(/^## \[/, "", s)
      gsub(/\].*$/, "", s)
      if (s != "Unreleased") { print $0; exit }
    }
  ' "$changelog_file")"
  if [[ -z "$line" ]]; then
    return 1
  fi
  # Extract version
  _ver="$(echo "$line" | sed 's/^## \[//; s/\].*//')"
  # Extract date if present (## [X.Y.Z] - YYYY-MM-DD)
  if echo "$line" | grep -q ' - [0-9]'; then
    _date="$(echo "$line" | sed 's/.*] - //')"
  fi
}

# Extract the changelog section for a given version from CHANGELOG.md.
# Captures everything between ## [X.Y.Z] and the next ## heading (or EOF).
extract_changelog() {
  local changelog_file="$1"
  local version="$2" # without leading v

  if [[ ! -f "$changelog_file" ]]; then
    return 1
  fi

  local result
  result="$(awk -v ver="$version" '
    BEGIN { found=0; printing=0 }
    /^## \[/ {
      if (printing) exit
      # Extract version between brackets
      s = $0
      gsub(/^## \[/, "", s)
      gsub(/\].*$/, "", s)
      if (s == ver) {
        found=1
        printing=1
        next
      }
    }
    printing { print }
    END { if (!found) exit 1 }
  ' "$changelog_file")"

  if [[ $? -ne 0 ]]; then
    return 1
  fi

  echo "$result"
}
