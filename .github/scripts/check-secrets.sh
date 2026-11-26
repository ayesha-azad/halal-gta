#!/usr/bin/env bash
# Lightweight secret scan that works both in CI (tracked files) and locally
# (all source files, excluding dependencies/build output).
# Pass --scan-dist to also check the generated frontend bundle.
set -euo pipefail

# Always scan the repository root, even when invoked from a subdirectory.
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

scan_dist=0
for arg in "$@"; do
  case "$arg" in
    --scan-dist) scan_dist=1 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

file_list="$(mktemp)"
trap 'rm -f "$file_list"' EXIT

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git ls-files > "$file_list"
else
  find . -type f \
    -not -path './.git/*' \
    -not -path './frontend/node_modules/*' \
    -not -path './backend/.venv/*' \
    -not -path './frontend/dist/*' \
    | sed 's#^\./##' > "$file_list"
fi

if [ "$scan_dist" -eq 1 ] && [ -d frontend/dist ]; then
  find frontend/dist -type f >> "$file_list"
fi

patterns=(
  'AKIA[0-9A-Z]{16}'
  'gh[pousr]_[A-Za-z0-9]{36,}'
  'sk-[A-Za-z0-9_-]{20,}'
  'xox[baprs]-[A-Za-z0-9-]{10,}'
  '-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----'
  'https?://[^[:space:]/]+:[^[:space:]@/]+@'
  "(API|ACCESS|AUTH|BEARER|PRIVATE|SESSION)[_-]?(KEY|SECRET|TOKEN)[[:space:]]*[:=][[:space:]]*[\"']?[A-Za-z0-9_-]{16,}"
  'VITE_[A-Z0-9_]*(KEY|SECRET|TOKEN|PASS)[A-Z0-9_]*[[:space:]]*='
)

found=0

for pattern in "${patterns[@]}"; do
  while IFS= read -r file; do
    [ -f "$file" ] || continue
    if grep -nHIE -e "$pattern" -- "$file" 2>/dev/null; then
      found=1
    fi
  done < "$file_list"
done

if [ "$found" -ne 0 ]; then
  echo "Potential secrets found in source files. Move them to .env and rotate them." >&2
  exit 1
fi

echo "No obvious secrets found in source files."
