import fetch from "node-fetch";

export async function fetchNode(client, fileKey, nodeId) {
  const [nodes, imageResponse] = await Promise.all([
    client.fileNodes(fileKey, { ids: [nodeId] }),
    client.fileImages(fileKey, {
      ids: [nodeId],
      scale: 1,
      format: "svg",
    }),
  ]);

  if (imageResponse.data.err) {
    throw new Error(`Failed to render nodes: ${imageResponse.data.err}`);
  }

  const [image] = await Promise.all(
    Object.entries(imageResponse.data.images)
      .filter((image) => image[0] === nodeId)
      .map(async ([nodeId, image]) => {
        if (!image) {
          throw new Error(`Failed to render a node (node-id=${nodeId}`);
        }

        const res = await fetch(image);

        if (res.status !== 200) {
          throw new Error(
            `Failed to fetch a rendered image: node-id=${nodeId}, url=${image}`,
          );
        }

        return res.buffer();
      }),
  );

  if (!image) {
    throw new Error("Image not found.");
  }

  return { response: nodes.data, image };
}
