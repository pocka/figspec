import fetch from "node-fetch";

export async function fetchFile(client, fileKey) {
  const fileResponse = await client.file(fileKey);

  const frames = listAllFrames(fileResponse.data.document);

  const imageResponse = await client.fileImages(fileKey, {
    ids: frames.map((frame) => frame.id),
    scale: 1,
    format: "svg",
  });

  const images = [];

  for (const [nodeId, image] of Object.entries(imageResponse.data.images)) {
    const res = await fetch(image);

    images.push({
      nodeId,
      data: await res.buffer(),
    });
  }

  return {
    response: fileResponse.data,
    images,
  };
}

function listAllFrames(node) {
  if ("absoluteBoundingBox" in node) {
    return [node];
  }

  if (!node.children || node.children.length === 0) {
    return [];
  }

  return node.children.map(listAllFrames).flat();
}
