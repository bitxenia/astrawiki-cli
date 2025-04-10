import * as fs from "fs/promises";
import path from "path";
import os from "os";
import { mkdir } from "fs/promises";
import { TMP_DIR } from "./constants.js";

const TMP_CONFIG_PATH = "/tmp/astrawiki-cli/config.json";
const SAVED_CONFIG_PATH = path.join(
  os.homedir(),
  ".config/astrawiki-cli/config.json",
);

export interface Config {
  wikiName?: string;
  publicIp?: string;
  isCollaborator?: boolean;
}

export async function generateConfig(
  flags: Config,
  file?: string,
): Promise<void> {
  let finalConfig: Config = defaultConfig;

  const savedFile = file ?? SAVED_CONFIG_PATH;
  if (await isFileValid(savedFile)) {
    const savedConfig = await readConfig(savedFile);
    finalConfig = overwriteConfig(finalConfig, savedConfig);
  }

  if (flags) {
    finalConfig = overwriteConfig(finalConfig, flags);
  }

  checkConfigValidity(finalConfig);
  await writeTmpConfig(finalConfig);
}

export async function getTmpConfig() {
  return readConfig(TMP_CONFIG_PATH);
}

const defaultConfig: Config = {
  isCollaborator: true,
};

async function isFileValid(path: string): Promise<boolean> {
  try {
    await fs.access(path, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function overwriteConfig(lowPriority: Config, highPriority: Config): Config {
  return {
    wikiName: highPriority.wikiName
      ? highPriority.wikiName
      : lowPriority.wikiName,
    publicIp: highPriority.publicIp
      ? highPriority.publicIp
      : lowPriority.publicIp,
    isCollaborator: highPriority.isCollaborator
      ? highPriority.isCollaborator
      : lowPriority.isCollaborator,
  };
}

function checkConfigValidity(config: Config): void {
  if (!config.publicIp) throw new Error("No public IP defined");
}

async function readConfig(file: string): Promise<Config> {
  const data = await fs.readFile(file, "utf-8");
  return JSON.parse(data);
}

async function writeTmpConfig(config: Config): Promise<void> {
  const json = JSON.stringify(config, null, 2);
  await mkdir(TMP_DIR, { recursive: true });
  await fs.writeFile(TMP_CONFIG_PATH, json, "utf-8");
}
