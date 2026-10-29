#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const html = join(process.cwd(), "examples/saas-mockup/index.html");
if (!existsSync(html)) {
  console.error("open-mockup: missing examples/saas-mockup/index.html");
  process.exit(1);
}
const url = pathToFileURL(html).href;
const platform = process.platform;
const cmd =
  platform === "darwin" ? "open" : platform === "win32" ? "cmd" : "xdg-open";
const args = platform === "win32" ? ["/c", "start", "", url] : [url];
const child = spawn(cmd, args, { stdio: "ignore", detached: true });
child.on("error", (err) => {
  console.error(`open-mockup: ${err.message}`);
  console.error(`Buka manual: ${url}`);
  process.exit(1);
});
child.unref();
console.log(url);
