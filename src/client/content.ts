import { readFile, writeFile, unlink } from "fs/promises";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";

const DEFAULT_EDITOR = "nano";

export async function getContent(file: string): Promise<string> {
  return readFile(file, "utf-8");
}

export async function editContent(content?: string): Promise<string> {
  const tmpFile = path.join(os.tmpdir(), `astrawiki-${Date.now()}.md`);
  await writeFile(tmpFile, content ?? "");

  const editor = process.env.EDITOR || DEFAULT_EDITOR;
  spawnSync(editor, [tmpFile], { stdio: "inherit" });

  const newContent = await readFile(tmpFile, "utf-8");
  await unlink(tmpFile);
  return newContent;
}
