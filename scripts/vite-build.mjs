import { spawnSync } from "node:child_process";
import { join } from "node:path";

function resolveMode() {
  const fromArg = process.argv[2];
  if (fromArg) return fromArg;

  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "preview" || vercelEnv === "development") return "demo";
  if (vercelEnv === "production") return "production";

  return "production";
}

const mode = resolveMode();
const viteJs = join(process.cwd(), "node_modules", "vite", "bin", "vite.js");

console.log(`[maati] vite build --mode ${mode}`);

const result = spawnSync(process.execPath, [viteJs, "build", "--mode", mode], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
