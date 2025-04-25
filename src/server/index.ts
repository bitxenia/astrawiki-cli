import express, { Request, Response, NextFunction } from "express";
import {
  createAstrawikiNode,
  AstrawikiNode,
  AstrawikiNodeInit,
} from "@bitxenia/astrawiki";
import { FsBlockstore } from "blockstore-fs";
import { FsDatastore } from "datastore-fs";
import { getTmpConfig } from "../utils/config.js";
import { HttpStatusCode } from "axios";

// Save the blockstore and datastore in the root directory
const BLOCKSTORE_DIR = "../../astrawiki_data/ipfs/block-store";
const DATASTORE_DIR = "../../astrawiki_data/ipfs/data-store";

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

  app.use((_req: Request, res: Response, next: NextFunction): void => {
    if (!node) {
      res
        .status(HttpStatusCode.ServiceUnavailable)
        .json({ message: "Server not ready." });
    } else {
      next();
    }
  });

  app.get("/articles", async (req, res) => {
    res.json({ articles: await node.getArticleList() });
  });

  app.get("/articles/:name", async (req, res) => {
    const response = await node.getArticle(req.params.name);
    res.json({ name: response.name, content: response.content });
  });

  app.patch("/articles/:name", async (req, res) => {
    const { content } = req.body;
    try {
      await node.editArticle(req.params.name, content);
      res.json({ message: "Article edited" });
    } catch {
      res
        .status(HttpStatusCode.InternalServerError)
        .json({ message: "Failed to edit article" });
    }
  });

  app.post("/articles/", async (req, res) => {
    const { name, content } = req.body;
    await node.newArticle(name, content);
    res.status(HttpStatusCode.Created).json({ message: "Article created" });
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
