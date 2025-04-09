import express from "express";
import {
  createAstrawikiNode,
  AstrawikiNode,
  AstrawikiNodeInit,
} from "@bitxenia/astrawiki";
import { FsBlockstore } from "blockstore-fs";
import { FsDatastore } from "datastore-fs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { getTmpConfig } from "../utils/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BLOCKSTORE_DIR = path.resolve(
  __dirname,
  "./astrawiki_data/ipfs/block-store",
);
const DATASTORE_DIR = path.resolve(
  __dirname,
  "./astrawiki_data/ipfs/data-store",
);

const PORT = 31337;

let node: AstrawikiNode | null = null;

async function startService() {
  const config = await getTmpConfig();
  const app = express();
  const opts: AstrawikiNodeInit = {
    blockstore: new FsBlockstore(BLOCKSTORE_DIR),
    datastore: new FsDatastore(DATASTORE_DIR),
    isCollaborator: config.isCollaborator,
    publicIP: config.publicIp,
    wikiName: config.wikiName,
  };

  node = await createAstrawikiNode(opts);
  app.use(express.json());

  app.get("/articles", async (req, res) => {
    if (!node) {
      res
        .status(400)
        .json({ message: "Server not running. Run astrawiki start" });
    } else {
      res.json({ articles: await node.getArticleList() });
    }
  });

  app.get("/articles/:name", async (req, res) => {
    if (!node) {
      res
        .status(400)
        .json({ message: "Server not running. Run astrawiki start" });
    } else {
      const response = await node.getArticle(req.params.name);
      res.json({ name: response.name, content: response.content });
    }
  });

  app.post("/articles/", async (req, res) => {
    if (!node) {
      res
        .status(400)
        .json({ message: "Server not running. Run astrawiki start" });
    } else {
      const { name, content } = req.body;
      await node.newArticle(name, content);
      res.status(201).json({ message: "Article created" });
    }
  });

  app.get("/", (req, res) => {
    res.json({ message: "Server running" });
  });

  app.listen(PORT, () => {
    console.log(`Astrawiki server running at http://localhost:${PORT}`);
  });
}

startService().catch((err) => {
  console.error("Failed to start Astrawiki service: ", err);
  process.exit(1);
});
