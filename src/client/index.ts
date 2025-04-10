#!/usr/bin/env node

import { program } from "commander";
import { generateConfig } from "../utils/config.js";
import { printLog } from "./logs.js";
import { editContent, getContent } from "./content.js";
import {
  addArticle,
  editArticle,
  getArticle,
  getArticleList,
  isServerRunning,
} from "./api.js";
import { isServiceUp, startServer, stopService } from "./service.js";
import { ERROR_PATH, LOG_PATH } from "../utils/constants.js";
import chalk from "chalk";
import { log } from "../utils/logger.js";
import ora from "ora";

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
    if (await isServiceUp()) {
      log.info(`${chalk.bold("Astrawiki")} service is already running`);
      process.exit(1);
    }

    const spinner = ora({
      text: `    Starting ${chalk.bold("Astrawiki")} service`,
      color: "yellow",
      spinner: "sand",
    }).start();
    await generateConfig(
      {
        wikiName: opts.name,
        isCollaborator: opts.collaborator,
        publicIp: opts.ip,
      },
      opts.config,
    );

    await startServer(opts.foreground);
    spinner.succeed(`${chalk.bold("Astrawiki")} service started`);
  });

program
  .command("stop")
  .description("Stop the astrawiki node")
  .action(async () => {
    if (!(await isServiceUp())) {
      log.info("Astrawiki service is not running.");
      return;
    }
    await stopService();
    log.success(`${chalk.bold("Astrawiki")} service stopped`);
  });

program
  .command("list")
  .description("List the articles in the wiki")
  .action(async () => {
    const articles = await getArticleList();
    console.log(articles.join("\n"));
  });

program
  .command("add")
  .description("Add an article to the wiki")
  .argument("<name>", "Name of the article to add")
  .argument("[file]", "File containing article content")
  .action(async (name: string, file?: string) => {
    const content = file ? await getContent(file) : await editContent();
    try {
      await addArticle(name, content);
      log.success(`${chalk.yellow.bold(name)} added`);
    } catch {
      log.error("Failed to add article");
    }
  });

program
  .command("edit")
  .description("Edit an article")
  .argument("<name>", "Name of the article to edit")
  .argument("[file]", "File containing updated article content")
  .action(async (name: string, file?: string) => {
    const { content } = await getArticle(name);
    let newContent = file ? await getContent(file) : await editContent(content);
    try {
      await editArticle(name, newContent);
      log.success(`"${chalk.yellow.bold(name)}" edited`);
    } catch {
      log.error("Failed to edit file");
    }
  });

program
  .command("get")
  .description("Get an article")
  .argument("<name>", "Name of the article to get")
  .action(async (name: string) => {
    const { content } = await getArticle(name);
    console.log(content);
  });

program
  .command("logs")
  .description("Astrawiki server logs")
  .option("-e --errors", "Show the error logs")
  .option("-f --follow", "Follow the logs")
  .action((opts) => {
    const logFile = opts.errors ? ERROR_PATH : LOG_PATH;
    printLog(logFile, opts.follow ? true : false);
  });

program
  .command("status")
  .description("Display the Astrawiki service status")
  .action(async () => {
    if (await isServerRunning()) {
      log.info(`${chalk.bold("Astrawiki")} service is running`);
    } else {
      log.error(
        `Astrawiki service is not running, check the errors using ${chalk.green("astrawiki logs -e")}`,
      );
    }
  });

program.parse(process.argv);
