import path from "path";
import { access, writeFile, readFile, unlink } from "fs/promises";
import fs, { openSync, readFileSync } from "fs";
import { spawn } from "child_process";
import { isServerRunning } from "./api.js";
import {
  ERROR_PATH,
  LOG_PATH,
  TMP_DIR,
  __dirname,
} from "../utils/constants.js";

const PID_FILE = path.join(TMP_DIR, "astrawiki.pid");
const SERVER_FILE = path.resolve(__dirname, "../server/index.js");

export async function startServer(foreground: boolean) {
  const out = openSync(LOG_PATH, "a");
  const err = openSync(ERROR_PATH, "a");

  if (foreground) {
    await writeFile(PID_FILE, "");
    await import("../server/index.js");
  } else {
  }
  const child = spawn(process.execPath, [SERVER_FILE], {
    detached: true,
    stdio: ["ignore", out, err],
  });
  child.unref();

  const ready = await waitForServer();
  if (ready) {
    fs.writeFileSync(PID_FILE, String(child.pid));
  } else {
    console.log("Timed out waiting for service to start");
    child.kill();
  }
}

export function killServiceIfUp(): void {
  try {
    const pidStr = readFileSync(PID_FILE, "utf-8");
    const pid = parseInt(pidStr.trim(), 10);
    process.kill(pid);
  } catch {}
}

async function waitForServer(timeout = 60000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await isServerRunning()) return true;
    await new Promise((res) => setTimeout(res, 300));
  }
  return false;
}
