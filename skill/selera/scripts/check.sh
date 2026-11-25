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
node "$S" set "bad key" x >/dev/null 2>&1 && { echo "FAIL: space in key accepted"; exit 1; }
node "$S" set .x y >/dev/null 2>&1 && { echo "FAIL: leading dot key accepted"; exit 1; }
node "$S" set newRole value >/dev/null || { echo "FAIL: well-formed new key rejected"; exit 1; }
node "$S" set fe.ui shadcn >/dev/null
out="$(node "$S" show)"
echo "$out" | grep -q "## Web" || { echo "FAIL: fe.ui not filed under Web"; exit 1; }
echo "$out" | grep -q "ui: shadcn" || { echo "FAIL: fe.ui not stored as ui"; exit 1; }
grep -q "## General" "$XDG_CONFIG_HOME/inisiasi/selera/profile.md" || { echo "FAIL: default section not General"; exit 1; }
echo "Free text the tools must keep." >> "$XDG_CONFIG_HOME/inisiasi/selera/profile.md"
node "$S" set packageManager pnpm >/dev/null
grep -q "Free text the tools must keep." "$XDG_CONFIG_HOME/inisiasi/selera/profile.md" || { echo "FAIL: set dropped free text"; exit 1; }
export SELERA_CONFIG="$XDG_CONFIG_HOME/global.md"
node "$S" set packageManager pnpm --project >/dev/null
out="$(node "$S" set packageManager npm --project)"
echo "$out" | grep -q "replaced packageManager: pnpm -> npm" || { echo "FAIL: project overwrite not reported"; exit 1; }
out="$(node "$S" setup --answers "bun")"
echo "$out" | grep -q "note packageManager: project profile keeps npm" || { echo "FAIL: shadowed global write not reported"; exit 1; }
echo "$out" | grep -q "replaced" && { echo "FAIL: false replaced report"; exit 1; }
# Fixture A: pnpm monorepo with workspace packages, biome config, turbo.
A="$(mktemp -d)"
cd "$A"
git init -q
echo '{"name":"root"}' > package.json
printf 'packages:\n  - "apps/*"\n  - "packages/*"\n' > pnpm-workspace.yaml
mkdir -p apps/web apps/api apps/mobile packages/core
echo '{"dependencies":{"react":"19","@tanstack/react-query":"5","react-router-dom":"7","tailwindcss":"4","vite":"6","zod":"3"}}' > apps/web/package.json
echo '{"dependencies":{"hono":"4","@orpc/server":"1","prisma":"6","pg":"8","graphile-worker":"0.16"}}' > apps/api/package.json
echo '{"dependencies":{"expo":"52","react-native":"0.76"}}' > apps/mobile/package.json
echo '{"devDependencies":{"vitest":"2","@playwright/test":"1"}}' > packages/core/package.json
echo '{ "quoteStyle": "double", "semicolons": "always", "lineWidth": 100 }' > biome.jsonc
echo '{}' > turbo.json
out="$(node "$S" learn)"
check_learn() {
  echo "$out" | grep -qE "^\s+$1\s+$2" || { echo "FAIL fixture ${3:-A}: $1 != $2"; echo "$out"; exit 1; }
}
check_learn validation zod
check_learn lint biome
check_learn format biome
check_learn quotes double
check_learn semicolons always
check_learn lineWidth 100
check_learn fe.fetch tanstack-query
check_learn fe.router react-router
check_learn fe.styling tailwind
check_learn fe.bundler vite
check_learn be.framework hono
check_learn be.api orpc
check_learn be.orm prisma
check_learn be.db postgres
check_learn be.queue graphile-worker
check_learn mobile.framework expo
check_learn e2e playwright
check_learn structure.repo monorepo
check_learn structure.build turbo

# Fixture B: single package, no formatter config, @/ imports in source.
B="$(mktemp -d)"
cd "$B"
git init -q
echo '{"dependencies":{"react":"19"}}' > package.json
mkdir -p src
i=1; while [ $i -le 25 ]; do
  printf 'import x from "@/lib/y";\nimport z from "@/lib/w";\n' > "src/f$i.ts"
  i=$((i + 1))
done
out="$(node "$S" learn)"
check_learn quotes double B
check_learn semicolons always B
check_learn imports alias B
check_learn structure.repo single B

echo "OK: selera commands"
