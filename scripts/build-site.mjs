#!/usr/bin/env node
// Assembles the three built apps into one static site in ./site:
//   site/                 side-by-side viewer
//   site/react-i18next/   react-i18next demo
//   site/lingui/          Lingui demo
// Run via `pnpm build:site` (which builds the apps first).
import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(root, "site");
const skipViteDir = (src) => !src.includes(".vite");

const requiredDirs = [
  join(root, "apps/side-by-side/dist"),
  join(root, "apps/react-i18next-demo/dist"),
  join(root, "apps/lingui-demo/dist"),
];

for (const dir of requiredDirs) {
  if (!existsSync(dir)) {
    console.error(`Missing build artifact: ${dir}\nRun "pnpm build" before "build:site".`);
    process.exit(1);
  }
}

rmSync(site, { recursive: true, force: true });
cpSync(join(root, "apps/side-by-side/dist"), site, { recursive: true, filter: skipViteDir });
cpSync(join(root, "apps/react-i18next-demo/dist"), join(site, "react-i18next"), { recursive: true, filter: skipViteDir });
cpSync(join(root, "apps/lingui-demo/dist"), join(site, "lingui"), { recursive: true, filter: skipViteDir });
console.log(`Site ready in ${site}`);
