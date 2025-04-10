import { readFile, writeFile, unlink } from "fs/promises";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { isContainer } from "../utils/constants.js";
import { BaseError } from "../utils/error.js";

const DEFAULT_EDITOR = "nano";

export enum ContentErrorType {
  CannotBeEmpty = "CannotBeEmpty",
  NotSupportedInContainer = "NotSupportedInContainer",
}

export class ContentError extends BaseError<ContentErrorType> {}

export async function getContent(file: string): Promise<string> {
  if (file === "") {
    throw new ContentError(
      ContentErrorType.CannotBeEmpty,
      "File name cannot be empty",
    );
  } else if (file === "-") {
    return await new Promise((resolve, reject) => {
      let data = "";
      process.stdin.setEncoding("utf-8");
      process.stdin.on("data", (chunk) => (data += chunk));
      process.stdin.on("end", () => resolve(data));
      process.stdin.on("error", reject);
    });
  } else if (isContainer) {
    throw new ContentError(
      ContentErrorType.NotSupportedInContainer,
      "Using files as input is unsupported inside a container.",
    );
  }
  return readFile(file, "utf-8");
}

export async function editContent(content?: string): Promise<string> {
  if (isContainer) {
    throw new ContentError(
      ContentErrorType.NotSupportedInContainer,
      "Creating a file in-place is unsupported inside a container.",
    );
  }
  const tmpFile = path.join(os.tmpdir(), `astrawiki-${Date.now()}.md`);
  await writeFile(tmpFile, content ?? "");

  const editor = process.env.EDITOR || DEFAULT_EDITOR;
  spawnSync(editor, [tmpFile], { stdio: "inherit" });

  const newContent = await readFile(tmpFile, "utf-8");
  await unlink(tmpFile);
  return newContent;
}
