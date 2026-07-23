#!/bin/bash
# Vercel build for the dg-technologies landing page.
# Works in both contexts:
#  - git-triggered builds: the repo is already checked out (artifacts/ exists);
#    a "repo" symlink satisfies the project's output directory setting
#    (repo/artifacts/dg-technologies/dist/public).
#  - file deployments: no checkout present, so clone the public repo first.
set -euo pipefail
if [ ! -d artifacts/dg-technologies ]; then
  git clone --depth 1 https://github.com/trademaster7777/DG-Technologies-Landing.git repo
else
  [ -e repo ] || ln -s . repo
fi
cd repo
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
corepack pnpm install --no-frozen-lockfile
cd artifacts/dg-technologies
PORT=5173 BASE_PATH=/ ./node_modules/.bin/vite build --config vite.config.ts
echo 'build complete'
