#!/bin/sh
# Smoke test: every documented command must run. Fails loudly if one disappears.
set -e
S="$(dirname "$0")/selera.mjs"
export XDG_CONFIG_HOME="$(mktemp -d)"
cd "$(mktemp -d)"
git init -q && echo '{"dependencies":{"zod":"1"}}' > package.json && echo x > pnpm-lock.yaml
for c in "show" "apply" "tree 1" "learn" "set validation zod" "set fe.fetch tanstack-query" "set bundler vite"; do
  node "$S" $c >/dev/null || { echo "FAIL: selera $c"; exit 1; }
done
node "$S" set bogus x >/dev/null 2>&1 && { echo "FAIL: bogus key accepted"; exit 1; }
echo "OK: selera commands"
