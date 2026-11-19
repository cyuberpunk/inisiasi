#!/bin/sh
# Smoke test: every documented command must run. Fails loudly if one disappears.
set -e
S="$(cd "$(dirname "$0")" && pwd)/selera.mjs"
export XDG_CONFIG_HOME="$(mktemp -d)"
cd "$(mktemp -d)"
git init -q && echo '{"dependencies":{"zod":"1"}}' > package.json && echo x > pnpm-lock.yaml
for c in "show" "apply" "tree 1" "learn" "set validation zod" "set fe.fetch tanstack-query" "set bundler vite"; do
  node "$S" $c >/dev/null || { echo "FAIL: selera $c"; exit 1; }
done
node "$S" set bogus x >/dev/null 2>&1 && { echo "FAIL: bogus key accepted"; exit 1; }
export SELERA_CONFIG="$XDG_CONFIG_HOME/global.json"
node "$S" set packageManager pnpm --project >/dev/null
out="$(node "$S" set packageManager npm --project)"
echo "$out" | grep -q "replaced packageManager: pnpm -> npm" || { echo "FAIL: project overwrite not reported"; exit 1; }
out="$(node "$S" setup --answers "bun")"
echo "$out" | grep -q "note packageManager: project profile keeps npm" || { echo "FAIL: shadowed global write not reported"; exit 1; }
echo "$out" | grep -q "replaced" && { echo "FAIL: false replaced report"; exit 1; }
echo "OK: selera commands"
