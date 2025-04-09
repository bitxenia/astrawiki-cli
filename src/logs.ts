import * as fs from "fs";

export function printLog(logFile: string, follow: boolean) {
  if (!fs.existsSync(logFile)) {
    console.log("No log file found.");
    return;
  }

  if (follow) {
    followLogFile(logFile);
  } else {
    console.log(fs.readFileSync(logFile, "utf-8"));
  }
}

function followLogFile(path: string) {
  console.log(`Reading entire log from ${path}...\n`);

  // Step 1: Read and print the full contents
  const fullContent = fs.readFileSync(path, "utf-8");
  process.stdout.write(fullContent);

  // Step 2: Start watching from the end
  let lastSize = fs.statSync(path).size;

  fs.watch(path, (eventType) => {
    if (eventType === "change") {
      const currentSize = fs.statSync(path).size;

      if (currentSize < lastSize) {
        // Log was rotated or truncated
        lastSize = 0;
      }

      const stream = fs.createReadStream(path, {
        encoding: "utf-8",
        start: lastSize,
        end: currentSize,
      });

      stream.on("data", (chunk) => {
        process.stdout.write(chunk);
      });

      lastSize = currentSize;
    }
  });
}
