import { existsSync } from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const TMP_DIR = "/tmp/astrawiki-cli";
export const LOG_PATH = path.join(TMP_DIR, "out.log");
export const ERROR_PATH = path.join(TMP_DIR, "error.log");

export const isContainer = existsSync("/.dockerenv");
