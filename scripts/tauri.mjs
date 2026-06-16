import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const candidates = [
  join(root, "node_modules", "@tauri-apps", "cli", "tauri.js"),
  join(root, "..", "famicom-chiptune", "node_modules", "@tauri-apps", "cli", "tauri.js"),
];
const cli = candidates.find((candidate) => existsSync(candidate));

if (!cli) {
  console.error("Tauri CLI is not installed. Run `npm install` first.");
  process.exit(1);
}

const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], {
  cwd: root,
  stdio: "inherit",
  shell: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  }
  process.exit(code ?? 1);
});
