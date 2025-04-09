#!/usr/bin/env node

import path, { dirname } from "path";
import fs from "fs";
import { program } from "commander";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import axios from "axios";
import { generateConfig } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_FILE = path.resolve(__dirname, "server.js");
const SERVER_ADDRESS = "http://localhost:31337";

const TMP_DIR = "/tmp/astrawiki-cli";
const PID_FILE = path.join(TMP_DIR, "astrawiki.pid");
const LOG_PATH = path.join(TMP_DIR, "out.log");
const ERROR_PATH = path.join(TMP_DIR, "error.log");

fs.mkdirSync(TMP_DIR, { recursive: true });
const out = fs.openSync(LOG_PATH, "a");
const err = fs.openSync(ERROR_PATH, "a");

program.name("astrawiki").description("Astrawiki node").version("0.0.1");

program
  .command("start")
  .description("Start the astrawiki node in the background")
  .option("--foreground", "Run server in the foreground")
  .option("-c --collaborator", "Pin all the wiki's articles")
  .option("--ip <address>", "Set your public IP")
  .option("-n --name <name>", "Specify the wiki's name to connect to")
  .option("-C --config <path>", "Path of the config to load")
  .action(async (opts) => {
    if (fs.existsSync(PID_FILE)) {
      console.log("Astrawiki is already running.");
      process.exit(1);
    }

    console.log("Starting Astrawiki service...");
    generateConfig(
      {
        wikiName: opts.name,
        isCollaborator: opts.collaborator,
        publicIp: opts.ip,
      },
      opts.config,
    );

    if (opts.foreground) {
      fs.writeFileSync(PID_FILE, "");
      await import("./server.js");
    } else {
    }
    const child = spawn(process.execPath, [SERVER_FILE], {
      detached: true,
      stdio: ["ignore", out, err],
    });
    child.unref();

    const ready = await waitForServer(SERVER_ADDRESS);
    if (ready) {
      console.log(`Astrawiki started in the background (PID: ${child.pid})`);
      fs.writeFileSync(PID_FILE, String(child.pid));
    } else {
      console.log("Timed out waiting for service to start");
      child.kill();
    }
  });

program
  .command("stop")
  .description("Stop the astrawiki node")
  .action(() => {
    if (!fs.existsSync(PID_FILE)) {
      console.log("Astrawiki is not running.");
      return;
    }

    const pid = parseInt(fs.readFileSync(PID_FILE, "utf-8"));
    try {
      process.kill(pid);
      fs.unlinkSync(PID_FILE);
      console.log(`Astrawiki stopped (PID: ${pid})`);
    } catch (err) {
      console.error("Failed to stop Astrawiki:", err);
      fs.unlinkSync(PID_FILE);
    }
  });

program
  .command("list")
  .description("List the articles in the wiki")
  .action(async () => {
    const { data } = await axios.get<{ articles: string[] }>(
      SERVER_ADDRESS + "/articles",
    );
    console.log("List of articles:", data.articles);
  });

program
  .command("logs")
  .description("Astrawiki server logs")
  .action(() => {
    if (!fs.existsSync(LOG_PATH)) {
      console.log("No log file found.");
      return;
    }
    const logContent = fs.readFileSync(LOG_PATH, "utf-8");
    console.log(logContent);
  });

program
  .command("errors")
  .description("Astrawiki server errors")
  .action(() => {
    if (!fs.existsSync(ERROR_PATH)) {
      console.log("No error file found.");
      return;
    }
    const errorContent = fs.readFileSync(ERROR_PATH, "utf-8");
    console.log(errorContent);
  });

program
  .command("status")
  .description("Display the Astrawiki service status")
  .action(async () => {
    try {
      await axios.get(SERVER_ADDRESS);
      console.log("Astrawiki service is running");
    } catch {
      console.log("Astrawiki service isn't running, check the errors");
    }
  });

async function waitForServer(url: string, timeout = 60000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await axios.get(url);
      return true;
    } catch {
      await new Promise((res) => setTimeout(res, 300));
    }
  }
  return false;
}

program.parse(process.argv);
