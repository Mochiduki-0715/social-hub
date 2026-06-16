import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

if (process.platform !== "win32") {
  console.error(
    [
      "Windows installers must be built on Windows.",
      "",
      "Use one of these:",
      "- Run `npm install` and `npm run build:windows` on a Windows PC.",
      "- Push this project to GitHub and run the Build Windows workflow.",
    ].join("\n"),
  );
  process.exit(1);
}

const child = spawn(
  process.execPath,
  [join(root, "scripts", "tauri.mjs"), "build", "--bundles", "nsis,msi"],
  {
    cwd: root,
    stdio: "inherit",
    shell: false,
  },
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  }
  process.exit(code ?? 1);
});
