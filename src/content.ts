import { readFile, writeFile, unlink } from "fs/promises";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";

export async function getContent(file?: string): Promise<string> {
  if (file) {
    return readFile(file, "utf-8");
  }
  const tmpFile = path.join(os.tmpdir(), `astrawiki-${Date.now()}.md`);
  await writeFile(tmpFile, "");

  const editor = process.env.EDITOR || "nano";
  spawnSync(editor, [tmpFile], { stdio: "inherit" });

  const content = await readFile(tmpFile, "utf-8");
  await unlink(tmpFile);
  return content;
}
