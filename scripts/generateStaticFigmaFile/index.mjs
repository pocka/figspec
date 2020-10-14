import { program } from "commander";
import * as dotenv from "dotenv";
import * as Figma from "figma-js";
import fetch from "node-fetch";
import * as fs from "fs/promises";
import * as path from "path";
import { URL, fileURLToPath } from "url";

import pkg from "./package.json";

const isFigmaURL = (url) =>
  /https:\/\/([w.-]+.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/.test(
    url
  );

program
  .version(pkg.version)
  .option("-o, --outDir <outDir>", "Directory to download", process.cwd())
  .option("-t, --token <token>", "Personal Access Token for Figma API")
  .option("-u, --url <url>", "Figma file/node url to fetch")
  .option("--pretty", "Pretty print JSON");

async function main() {
  const token = program.token || process.env.FIGMA_TOKEN;

  if (!token) {
    console.error("Personal Access Token is required.");
    process.exit(1);
  }

  if (!program.url) {
    console.error("File/Node url is required.");
    process.exit(1);
  }

  if (!isFigmaURL(program.url)) {
    console.error("The URL is not a valid Figma URL.");
    process.exit(1);
  }

  const url = new URL(program.url);

  const fileKey = url.pathname.split("/")[2];
  const nodeId = url.searchParams.get("node-id") || null;

  if (!nodeId) {
    console.error("Fetching an entire file is not implemented yet.");
    process.exit(1);
  }

  const figma = Figma.Client({
    personalAccessToken: token,
  });

  const [nodes, images] = await Promise.all([
    figma.fileNodes(fileKey, { ids: [nodeId] }),
    figma.fileImages(fileKey, {
      ids: [nodeId],
      scale: 1,
      format: "svg",
    }),
  ]);

  if (images.data.err) {
    console.error(`Failed to render nodes: ${images.data.err}`);
    process.exit(1);
  }

  const outDir = path.resolve(
    path.isAbsolute(program.outDir)
      ? program.outDir
      : path.resolve(process.env.INIT_CWD, program.outDir),
    fileKey
  );

  try {
    await fs.rmdir(outDir, {
      recursive: true,
    });
  } catch (err) {
    // Ignore when the dir does not exist
    if (err.code !== "ENOENT") {
      throw err;
    }
  }

  await fs.mkdir(outDir, {
    recursive: true,
  });

  await Promise.all(
    Object.entries(images.data.images).map(async ([nodeId, image]) => {
      if (!image) {
        throw new Error(`Failed to render a node (node-id=${nodeId}`);
      }

      const res = await fetch(image);

      if (res.status !== 200) {
        throw new Error(
          `Failed to fetch a rendered image: node-id=${nodeId}, url=${image}`
        );
      }

      await fs.writeFile(
        path.resolve(outDir, nodeId + ".svg"),
        await res.buffer()
      );
    })
  );

  await fs.writeFile(
    path.resolve(outDir, `${nodeId}.json`),
    program.pretty
      ? JSON.stringify(nodes.data, null, 2)
      : JSON.stringify(nodes.data)
  );
}

dotenv.config({
  path: path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../.env"
  ),
});
program.parse();
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
