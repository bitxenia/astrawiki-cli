import chalk from "chalk";

export const log = {
  info: (msg: string) => console.log(chalk.blue("ℹ    "), msg),
  warn: (msg: string) => console.log(chalk.yellow("⚠    "), msg),
  error: (msg: string) => console.log(chalk.red("✖    "), msg),
  success: (msg: string) => console.log(chalk.green("✔    "), msg),
};
