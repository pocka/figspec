import fetch from "node-fetch";

export async function fetchFile(client, fileKey) {
  const fileResponse = await client.file(fileKey);

  return fileResponse.data;
}
