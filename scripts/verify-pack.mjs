#!/usr/bin/env node
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const tmp = mkdtempSync(join(tmpdir(), "gapura-pack-"));
try {
  execSync("npm pack --pack-destination " + tmp, { cwd: root, stdio: "pipe" });
  const tgz = execSync(`ls ${tmp}/*.tgz`, { encoding: "utf8" }).trim().split("\n")[0];
  const installDir = join(tmp, "install");
  execSync(`mkdir -p ${installDir} && cd ${installDir} && npm init -y && npm install ${tgz}`, {
    stdio: "pipe",
  });
  execSync(
    `node --input-type=module -e "import 'gapura/wrap'; console.log('ok')"`,
    { cwd: installDir, stdio: "pipe" },
  );
  execSync(`cd ${installDir} && npx gapura demo --out ./demo-out`, {
    stdio: "pipe",
  });
  console.log("verify-pack: ok");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
