import { MEDIA_MAX_BYTES, mediaAsset, serveMedia } from "../lib/media.ts";

const HASH = "a".repeat(64);
const ASSET = `${HASH}.png`;
const ORIGIN = "https://stampchain.io/stamps/";
const PNG = decode(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
);
const GIF = decode("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
// Independently encoded 1x1 white images (Pillow), not parser-shaped stubs.
const WEBP = decode(
  "UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAUAmJaQAA3AA/vz0AAA=",
);
const JPEG = decode(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==",
);

function decode(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

function assert(
  condition: unknown,
  message = "Assertion failed",
): asserts condition {
  if (!condition) throw new Error(message);
}

function respond(bytes: Uint8Array, mime = "image/png"): typeof fetch {
  return () =>
    Promise.resolve(
      new Response(new Uint8Array(bytes).buffer, {
        headers: { "Content-Type": mime },
      }),
    );
}

Deno.test("media accepts only exact canonical static URLs and asset names", async () => {
  assert(mediaAsset(ORIGIN + ASSET) === ASSET);
  for (
    const url of [
      null,
      `/stamps/${ASSET}`,
      `http://stampchain.io/stamps/${ASSET}`,
      `https://stampchain.io.evil.test/stamps/${ASSET}`,
      `https://stampchain.io@evil.test/stamps/${ASSET}`,
      `https://user:password@stampchain.io/stamps/${ASSET}`,
      `https://stampchain.io:444/stamps/${ASSET}`,
      `${ORIGIN}${ASSET}?refresh=true`,
      `${ORIGIN}${ASSET}#fragment`,
      `${ORIGIN}../${ASSET}`,
      `${ORIGIN}%2e%2e/${ASSET}`,
      `${ORIGIN}${HASH}.svg`,
      `${ORIGIN}${HASH.toUpperCase()}.png`,
      `https://stampchain.io/content/${HASH}`,
      "https://stampchain.io/api/v2/stamp/123/preview",
    ]
  ) {
    assert(mediaAsset(url) === null, `Accepted unsafe URL: ${url}`);
  }
  for (
    const asset of [
      "../" + ASSET,
      "https://evil.test/" + ASSET,
      ASSET + "?refresh=true",
      HASH + ".html",
      HASH + ".svg",
      ASSET.toUpperCase(),
      "%2e%2e/" + ASSET,
    ]
  ) {
    const result = await serveMedia(asset, "live", () => {
      throw new Error("Invalid asset reached fetch");
    });
    assert(result.status === 404);
    assert((await result.text()) === "Media unavailable");
  }
});

Deno.test("verified raster response has a fixed origin and restrictive headers", async () => {
  const result = await serveMedia(ASSET, "live", (input, init) => {
    const request = init as {
      method?: string;
      redirect?: string;
      credentials?: string;
      referrerPolicy?: string;
    };
    assert(input === ORIGIN + ASSET);
    assert(request?.method === "GET" && request.redirect === "error");
    assert(
      request.credentials === "omit" &&
        request.referrerPolicy === "no-referrer",
    );
    return respond(PNG)(input, init);
  });
  assert(result.status === 200);
  assert(result.headers.get("Content-Type") === "image/png");
  assert(result.headers.get("Content-Length") === String(PNG.length));
  assert(result.headers.get("X-Content-Type-Options") === "nosniff");
  assert(
    result.headers.get("Content-Security-Policy") ===
      "sandbox; default-src 'none'",
  );
  assert(result.headers.get("Cache-Control") === "public, max-age=300");
  assert(result.headers.get("Set-Cookie") === null);
  assert(
    new Uint8Array(await result.arrayBuffer()).every((byte, i) =>
      byte === PNG[i]
    ),
  );
});

Deno.test("independently encoded static GIF, JPEG and WebP pass", async () => {
  for (
    const [extension, mime, bytes] of [
      ["gif", "image/gif", GIF],
      ["jpg", "image/jpeg", JPEG],
      ["jpeg", "image/jpeg", JPEG],
      ["webp", "image/webp", WEBP],
    ] as const
  ) {
    const result = await serveMedia(
      `${HASH}.${extension}`,
      "live",
      respond(bytes, mime),
    );
    assert(result.status === 200, `${extension} failed`);
    await result.arrayBuffer();
  }
});

Deno.test("HTML, SVG, MIME mismatches, corruption and trailing data fail closed", async () => {
  const corrupt = PNG.slice();
  corrupt[corrupt.length - 1] ^= 1;
  const trailing = new Uint8Array(PNG.length + 5);
  trailing.set(PNG);
  trailing.set(new TextEncoder().encode("<svg>"), PNG.length);
  for (
    const [bytes, mime] of [
      [new TextEncoder().encode("<svg onload='alert(1)'/>"), "image/png"],
      [
        new TextEncoder().encode("<!doctype html><script>alert(1)</script>"),
        "image/png",
      ],
      [PNG, "image/svg+xml"],
      [PNG, "text/html"],
      [PNG, "image/jpeg"],
      [GIF, "image/png"],
      [corrupt, "image/png"],
      [PNG.subarray(0, PNG.length - 4), "image/png"],
      [trailing, "image/png"],
    ] as const
  ) {
    const result = await serveMedia(ASSET, "live", respond(bytes, mime));
    assert(result.status === 502);
    assert(result.headers.get("Content-Type") === "text/plain; charset=utf-8");
    assert((await result.text()) === "Media unavailable");
  }
});

Deno.test("zero dimensions, oversize sides and pixel bombs are rejected", async () => {
  // Header checksums were independently calculated with Python zlib.crc32.
  for (
    const [width, height, checksum] of [
      [0, 1, 0x5ade673c],
      [4097, 1, 0x1beac8c9],
      [1, 4097, 0xd2c290cc],
      [3000, 3000, 0xdb1c3df2],
    ]
  ) {
    const bytes = PNG.slice();
    const view = new DataView(bytes.buffer);
    view.setUint32(16, width);
    view.setUint32(20, height);
    view.setUint32(29, checksum);
    const result = await serveMedia(ASSET, "live", respond(bytes));
    assert(result.status === 502, `Accepted ${width} x ${height}`);
    await result.text();
  }
  const hugeGif = GIF.slice();
  new DataView(hugeGif.buffer).setUint16(6, 4097, true);
  assert(
    (await serveMedia(`${HASH}.gif`, "live", respond(hugeGif, "image/gif")))
      .status === 502,
  );
  const hugeWebp = WEBP.slice();
  new DataView(hugeWebp.buffer).setUint16(26, 4097, true);
  assert(
    (await serveMedia(`${HASH}.webp`, "live", respond(hugeWebp, "image/webp")))
      .status === 502,
  );
});

Deno.test("animated GIF is rejected instead of accumulating unbounded frames", async () => {
  const imageStart = GIF.indexOf(0x2c, 13);
  assert(imageStart > 0);
  const secondFrame = GIF.subarray(imageStart, GIF.length - 1);
  const animated = new Uint8Array(GIF.length + secondFrame.length);
  animated.set(GIF.subarray(0, GIF.length - 1));
  animated.set(secondFrame, GIF.length - 1);
  animated[animated.length - 1] = 0x3b;
  const result = await serveMedia(
    `${HASH}.gif`,
    "live",
    respond(animated, "image/gif"),
  );
  assert(result.status === 502);
  await result.text();
});

Deno.test("redirect responses never reach a second URL", async () => {
  let calls = 0;
  const result = await serveMedia(ASSET, "live", (_input, init) => {
    calls++;
    assert((init as { redirect?: string })?.redirect === "error");
    return Promise.resolve(
      new Response(null, {
        status: 302,
        headers: { Location: "http://169.254.169.254/latest/meta-data/" },
      }),
    );
  });
  assert(result.status === 502 && calls === 1);
  await result.text();
});

Deno.test("response limit applies to both declared and streamed bytes", async () => {
  const declared: typeof fetch = () =>
    Promise.resolve(
      new Response(new Uint8Array(PNG).buffer, {
        headers: {
          "Content-Type": "image/png",
          "Content-Length": String(MEDIA_MAX_BYTES + 1),
        },
      }),
    );
  assert((await serveMedia(ASSET, "live", declared)).status === 502);
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(MEDIA_MAX_BYTES));
      controller.enqueue(new Uint8Array(1));
    },
    cancel() {
      cancelled = true;
    },
  });
  const streamed: typeof fetch = () =>
    Promise.resolve(
      new Response(stream, {
        headers: { "Content-Type": "image/png" },
      }),
    );
  const result = await serveMedia(ASSET, "live", streamed);
  assert(result.status === 502 && cancelled);
  await result.text();
});

Deno.test("timeout bounds both stalled fetch and stalled body reads", async () => {
  const never: typeof fetch = () => new Promise(() => {});
  const start = performance.now();
  const first = await serveMedia(ASSET, "live", never, { timeoutMs: 5 });
  assert(first.status === 502 && performance.now() - start < 500);
  await first.text();
  let cancelled = false;
  const stream = new ReadableStream<Uint8Array>({
    pull: () => new Promise(() => {}),
    cancel() {
      cancelled = true;
    },
  });
  const stalled: typeof fetch = () =>
    Promise.resolve(
      new Response(stream, {
        headers: { "Content-Type": "image/png" },
      }),
    );
  const second = await serveMedia(ASSET, "live", stalled, { timeoutMs: 5 });
  assert(second.status === 502 && cancelled);
  await second.text();
});

Deno.test("fixture media uses sampled files without making network calls", async () => {
  let count = 0;
  for await (
    const entry of Deno.readDir(new URL("../fixtures/media/", import.meta.url))
  ) {
    if (!entry.isFile) continue;
    assert(entry.name.endsWith(".png"));
    const result = await serveMedia(entry.name, "fixture", () => {
      throw new Error("Fixture mode made a network call");
    });
    assert(result.status === 200, `Sampled fixture failed: ${entry.name}`);
    assert((await result.arrayBuffer()).byteLength <= MEDIA_MAX_BYTES);
    count++;
  }
  assert(count > 0, "Expected preselected sampled media files");
  const absent = await serveMedia(`${"f".repeat(64)}.png`, "fixture");
  assert(absent.status === 404);
  await absent.text();
});
