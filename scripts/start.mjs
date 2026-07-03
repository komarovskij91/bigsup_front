import { writeFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";

const apiBase = process.env.API_BASE || process.env.VITE_API_BASE || "";
const port = process.env.PORT || "4173";

if (existsSync("dist")) {
  writeFileSync(
    "dist/runtime-config.js",
    `window.__BIGSUP_API_BASE__=${JSON.stringify(apiBase)};\n`
  );
}

const child = spawn(
  "npx",
  ["vite", "preview", "--host", "0.0.0.0", "--port", port],
  { stdio: "inherit", shell: true, env: process.env }
);

child.on("exit", (code) => process.exit(code ?? 0));
