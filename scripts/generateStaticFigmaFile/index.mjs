import { program } from "commander";
import * as dotenv from "dotenv";
import * as Figma from "figma-js";
import * as fs from "fs/promises";
import * as path from "path";
import { URL, fileURLToPath } from "url";

import pkg from "../../package.json" assert { type: "json" };

import { fetchFile } from "./fetchFile.mjs";
import { fetchNode } from "./fetchNode.mjs";

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

  const figma = Figma.Client({
    personalAccessToken: token,
  });

  const files = await (async () => {
    if (nodeId) {
      const node = await fetchNode(figma, fileKey, nodeId);

      return [
        {
          filename: `${nodeId}.json`,
          data: program.pretty
            ? JSON.stringify(node.response, null, 2)
            : JSON.stringify(node.response),
        },
        {
          filename: `${nodeId}.svg`,
          data: node.image,
        },
      ];
    }

    const file = await fetchFile(figma, fileKey);

    return [
      {
        filename: "file.json",
        data: program.pretty
          ? JSON.stringify(file.response, null, 2)
          : JSON.stringify(file.response),
      },
      ...file.images.map((image) => ({
        filename: `${image.nodeId}.svg`,
        data: image.data,
      })),
    ];
  })();

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
    files.map(async (file) => {
      await fs.writeFile(path.resolve(outDir, file.filename), file.data);
    })
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
