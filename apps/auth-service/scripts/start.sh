#!/usr/bin/env bash
sleep 10
npx drizzle-kit generate
npx drizzle-kit migrate
node ./dist/src/index.js