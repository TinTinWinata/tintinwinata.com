import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = resolve(projectRoot, "dist");
const serverRoot = resolve(distRoot, "server");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name === "server" || entry.name === ".openai") continue;
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolutePath));
    else files.push(absolutePath);
  }

  return files;
}

const files = await collectFiles(distRoot);
const assets = Object.fromEntries(await Promise.all(files.map(async (file) => {
  const pathname = `/${relative(distRoot, file).split(sep).join("/")}`;
  const body = (await readFile(file)).toString("base64");
  const type = mimeTypes[extname(file).toLowerCase()] ?? "application/octet-stream";
  return [pathname, { body, type }];
})));

await mkdir(serverRoot, { recursive: true });
await writeFile(
  resolve(serverRoot, "index.js"),
  `const assets = ${JSON.stringify(assets)};

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    if (pathname.endsWith("/")) pathname += "index.html";
    let asset = assets[pathname];
    if (!asset && !pathname.split("/").at(-1)?.includes(".")) asset = assets["/index.html"];
    if (!asset) return new Response("Not found", { status: 404 });

    const headers = new Headers({
      "Content-Type": asset.type,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": pathname === "/index.html"
        ? "public, max-age=0, must-revalidate"
        : pathname.startsWith("/_astro/")
          ? "public, max-age=31536000, immutable"
          : "public, max-age=86400",
    });

    return new Response(request.method === "HEAD" ? null : decodeBase64(asset.body), {
      status: 200,
      headers,
    });
  },
};
`,
  "utf8",
);
