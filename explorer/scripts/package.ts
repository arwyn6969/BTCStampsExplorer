// Package the tested local artifact, without importing or copying the legacy app.
// Run after the final production build. No deployment is performed.
const outputDirectory = Deno.args[0];
if (!outputDirectory?.startsWith("/")) {
  throw new Error("Usage: package.ts /absolute/output/directory");
}
const root = new URL("../../", import.meta.url);
const encoder = new TextEncoder();
const files = new Map<string, Uint8Array>();
const roots = [
  "explorer/deno.json",
  "explorer/deno.lock",
  "explorer/main.ts",
  "explorer/build.ts",
  "explorer/fresh.gen.ts",
  "explorer/fresh.config.ts",
  "explorer/Dockerfile",
  "explorer/components",
  "explorer/lib",
  "explorer/routes",
  "explorer/static",
  "explorer/fixtures",
  "explorer/_fresh",
  "explorer/scripts",
  "explorer/tests",
  "lib/constants/stampConstants.ts",
];

async function collect(path: string): Promise<void> {
  const url = new URL(path, root);
  const stat = await Deno.lstat(url);
  if (stat.isSymlink) {
    throw new Error(`Symlink is not a package input: ${path}`);
  }
  if (stat.isDirectory) {
    const children = [];
    for await (const entry of Deno.readDir(url)) children.push(entry.name);
    for (const child of children.sort()) {
      if (child.startsWith(".") || child === "node_modules") {
        throw new Error(`Unexpected package input: ${path}/${child}`);
      }
      await collect(`${path}/${child}`);
    }
  } else {
    if (!stat.isFile || stat.size > 16 * 1024 * 1024) {
      throw new Error(`Unsupported package input: ${path}`);
    }
    files.set(path, await Deno.readFile(url));
  }
}

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

async function sha256(bytes: Uint8Array): Promise<string> {
  return hex(
    await crypto.subtle.digest("SHA-256", new Uint8Array(bytes).buffer),
  );
}

async function git(args: string[]): Promise<string> {
  const command = new Deno.Command("git", {
    args,
    cwd: root,
    stdout: "piped",
    stderr: "piped",
  });
  const result = await command.output();
  if (!result.success) throw new Error("Cannot record package source revision");
  return new TextDecoder().decode(result.stdout).trim();
}

function header(path: string, size: number): Uint8Array {
  const result = new Uint8Array(512);
  const field = (offset: number, length: number, value: string) => {
    const encoded = encoder.encode(value);
    if (encoded.length > length) throw new Error(`Tar field too long: ${path}`);
    result.set(encoded, offset);
  };
  const octal = (offset: number, length: number, value: number) =>
    field(offset, length, value.toString(8).padStart(length - 1, "0") + "\0");
  let basename = path;
  let prefix = "";
  if (encoder.encode(path).length > 100) {
    const slash = path.lastIndexOf("/");
    prefix = path.slice(0, slash);
    basename = path.slice(slash + 1);
  }
  field(0, 100, basename);
  octal(100, 8, 0o644);
  octal(108, 8, 0);
  octal(116, 8, 0);
  octal(124, 12, size);
  octal(136, 12, 0);
  result.fill(0x20, 148, 156);
  field(156, 1, "0");
  field(257, 6, "ustar\0");
  field(263, 2, "00");
  field(345, 155, prefix);
  const checksum = result.reduce((sum, byte) => sum + byte, 0);
  field(148, 8, checksum.toString(8).padStart(6, "0") + "\0 ");
  return result;
}

for (const path of roots) await collect(path);
const readme = new URL("explorer/README.md", root);
try {
  await Deno.stat(readme);
  await collect("explorer/README.md");
} catch (error) {
  if (!(error instanceof Deno.errors.NotFound)) throw error;
}
const snapshot = JSON.parse(
  new TextDecoder().decode(files.get("explorer/_fresh/snapshot.json")),
);
if (typeof snapshot.build_id !== "string") {
  throw new Error("Missing production snapshot");
}
const sourceRevision = await git(["rev-parse", "HEAD"]);
const sourceState = await git([
  "status",
  "--porcelain",
  "--",
  "explorer",
  "lib/constants/stampConstants.ts",
]);
const inventory = [];
for (
  const [path, bytes] of [...files].sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0
  )
) {
  inventory.push({ path, bytes: bytes.length, sha256: await sha256(bytes) });
}
const manifest = {
  format: "stampchain-explorer-proof-v1",
  sourceRevision,
  sourceState,
  freshBuildId: snapshot.build_id,
  note:
    "A local artifact, not a staging deployment. Runtime imports use the pinned lock and require a populated Deno cache; the Dockerfile builds that cache separately.",
  files: inventory,
};
const manifestBytes = encoder.encode(JSON.stringify(manifest, null, 2) + "\n");
files.set("artifact-manifest.json", manifestBytes);
const entries = [...files].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
const total = entries.reduce(
  (size, [, bytes]) => size + 512 + Math.ceil(bytes.length / 512) * 512,
  1024,
);
if (total > 128 * 1024 * 1024) {
  throw new Error("Proof package exceeds the expected size");
}
const tar = new Uint8Array(total);
let offset = 0;
for (const [path, bytes] of entries) {
  tar.set(header(path, bytes.length), offset);
  offset += 512;
  tar.set(bytes, offset);
  offset += Math.ceil(bytes.length / 512) * 512;
}
const stream = new ReadableStream<BufferSource>({
  start(controller) {
    controller.enqueue(tar.buffer);
    controller.close();
  },
}).pipeThrough(new CompressionStream("gzip"));
const archive = new Uint8Array(await new Response(stream).arrayBuffer());
const digest = await sha256(archive);
const filename = `explorer-${sourceRevision.slice(0, 12)}-${
  digest.slice(0, 12)
}.tar.gz`;
await Deno.mkdir(outputDirectory, { recursive: true });
const path = `${outputDirectory.replace(/\/$/, "")}/${filename}`;
await Deno.writeFile(path, archive);
await Deno.writeFile(`${path}.manifest.json`, manifestBytes);
console.log(JSON.stringify(
  {
    artifact: path,
    sha256: digest,
    bytes: archive.length,
    sourceRevision,
    freshBuildId: snapshot.build_id,
    fileCount: inventory.length,
    manifest: `${path}.manifest.json`,
  },
  null,
  2,
));
