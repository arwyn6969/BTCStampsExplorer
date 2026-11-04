const ASSET = /^[a-f0-9]{64}\.(png|jpg|jpeg|gif|webp)$/;
const STAMP_ID = /^(?:0|[1-9]\d{0,15}|-[1-9]\d{0,15})$/;
const PREVIEW_ASSET = /^preview-((?:0|[1-9]\d{0,15}|-[1-9]\d{0,15}))\.png$/;
const STATIC_MEDIA = "https://stampchain.io/stamps/";
export const MEDIA_MAX_BYTES = 2 * 1024 * 1024;
const MAX_DIMENSION = 4096;
const MAX_PIXELS = 8_000_000;
const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};

/** Only established static originals, never caller-selected hosts or routes. */
export function mediaAsset(url: string | null): string | null {
  if (!url?.startsWith(STATIC_MEDIA)) return null;
  const asset = url.slice(STATIC_MEDIA.length);
  return ASSET.test(asset) ? asset : null;
}

/** Existing PNG thumbnails only; a missing file never triggers generation. */
export function htmlPreviewAsset(id: string): string | null {
  if (!STAMP_ID.test(id)) return null;
  const number = BigInt(id);
  if (number < -9007199254740991n || number > 9007199254740991n) return null;
  return `preview-${id}.png`;
}

function assetSource(
  asset: string,
): { extension: string; url: string } | null {
  const raster = ASSET.exec(asset);
  if (raster) return { extension: raster[1], url: STATIC_MEDIA + asset };
  const preview = PREVIEW_ASSET.exec(asset);
  if (preview && htmlPreviewAsset(preview[1]) === asset) {
    return {
      extension: "png",
      url: `${STATIC_MEDIA}previews/${preview[1]}.png`,
    };
  }
  return null;
}

function check(condition: unknown): asserts condition {
  if (!condition) throw new Error("Unsupported media");
}

function dimensions(width: number, height: number): void {
  check(
    width > 0 && height > 0 && width <= MAX_DIMENSION &&
      height <= MAX_DIMENSION && width * height <= MAX_PIXELS,
  );
}

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function png(bytes: Uint8Array, view: DataView): void {
  check(
    bytes.length >= 45 &&
      [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v),
  );
  let offset = 8;
  let header = false;
  let image = false;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const end = offset + 12 + length;
    check(end <= bytes.length);
    const type = ascii(bytes, offset + 4, 4);
    check(/^[A-Za-z]{4}$/.test(type));
    check(
      crc32(bytes.subarray(offset + 4, end - 4)) === view.getUint32(end - 4),
    );
    check(!["acTL", "fcTL", "fdAT"].includes(type));
    if (!header) {
      check(type === "IHDR" && length === 13);
      dimensions(view.getUint32(offset + 8), view.getUint32(offset + 12));
      const depth = bytes[offset + 16];
      const color = bytes[offset + 17];
      const depths: Record<number, number[]> = {
        0: [1, 2, 4, 8, 16],
        2: [8, 16],
        3: [1, 2, 4, 8],
        4: [8, 16],
        6: [8, 16],
      };
      check(depths[color]?.includes(depth));
      check(bytes[offset + 18] === 0 && bytes[offset + 19] === 0);
      check(bytes[offset + 20] <= 1);
      header = true;
    } else if (type === "IDAT") {
      image ||= length > 0;
    } else if (type === "IEND") {
      check(length === 0 && image && end === bytes.length);
      return;
    } else {
      check(type !== "IHDR");
      check(type === "PLTE" || type[0] === type[0].toLowerCase());
    }
    offset = end;
  }
  throw new Error("Incomplete PNG");
}

function gif(bytes: Uint8Array, view: DataView): void {
  check(
    bytes.length >= 14 && ["GIF87a", "GIF89a"].includes(ascii(bytes, 0, 6)),
  );
  const width = view.getUint16(6, true);
  const height = view.getUint16(8, true);
  dimensions(width, height);
  let offset = 13;
  if (bytes[10] & 0x80) offset += 3 * (1 << ((bytes[10] & 7) + 1));
  let frames = 0;
  function blocks(): void {
    while (offset < bytes.length) {
      const length = bytes[offset++];
      if (length === 0) return;
      offset += length;
      check(offset <= bytes.length);
    }
    throw new Error("Incomplete GIF");
  }
  while (offset < bytes.length) {
    const type = bytes[offset++];
    if (type === 0x3b) {
      check(frames === 1 && offset === bytes.length);
      return;
    }
    if (type === 0x21) {
      check(offset < bytes.length);
      offset++; // Extension label; its payload consists of bounded sub-blocks.
      blocks();
    } else {
      check(type === 0x2c && offset + 9 <= bytes.length && ++frames === 1);
      const left = view.getUint16(offset, true);
      const top = view.getUint16(offset + 2, true);
      const frameWidth = view.getUint16(offset + 4, true);
      const frameHeight = view.getUint16(offset + 6, true);
      dimensions(frameWidth, frameHeight);
      check(left + frameWidth <= width && top + frameHeight <= height);
      const packed = bytes[offset + 8];
      offset += 9;
      if (packed & 0x80) offset += 3 * (1 << ((packed & 7) + 1));
      check(offset < bytes.length && bytes[offset] >= 2 && bytes[offset] <= 8);
      offset++;
      blocks();
    }
  }
  throw new Error("Incomplete GIF");
}

function jpeg(bytes: Uint8Array, view: DataView): void {
  check(bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8);
  let offset = 2;
  let frame = false;
  let scan = false;
  while (offset < bytes.length) {
    check(bytes[offset++] === 0xff);
    while (bytes[offset] === 0xff) offset++;
    check(offset < bytes.length);
    const marker = bytes[offset++];
    if (marker === 0xd9) {
      check(frame && scan && offset === bytes.length);
      return;
    }
    check(
      marker !== 0 && marker !== 0xd8 && !(marker >= 0xd0 && marker <= 0xd7),
    );
    check(offset + 2 <= bytes.length);
    const length = view.getUint16(offset);
    check(length >= 2 && offset + length <= bytes.length);
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      check(!frame && length >= 11 && bytes[offset + 2] === 8);
      dimensions(view.getUint16(offset + 5), view.getUint16(offset + 3));
      check([1, 3, 4].includes(bytes[offset + 7]));
      check(length === 8 + 3 * bytes[offset + 7]);
      frame = true;
    } else {
      // Other SOF variants are unsupported; fail closed rather than guess.
      check(
        !(marker >= 0xc0 && marker <= 0xcf) ||
          [0xc4, 0xc8, 0xcc].includes(marker),
      );
    }
    offset += length;
    if (marker === 0xda) {
      check(frame);
      scan = true;
      // Skip entropy data, including stuffed 0xff and restart markers.
      while (offset < bytes.length) {
        if (bytes[offset] !== 0xff) {
          offset++;
        } else if (
          bytes[offset + 1] === 0 ||
          (bytes[offset + 1] >= 0xd0 && bytes[offset + 1] <= 0xd7)
        ) {
          offset += 2;
        } else {
          break;
        }
      }
    }
  }
  throw new Error("Incomplete JPEG");
}

function webp(bytes: Uint8Array, view: DataView): void {
  check(
    bytes.length >= 20 && ascii(bytes, 0, 4) === "RIFF" &&
      ascii(bytes, 8, 4) === "WEBP" &&
      view.getUint32(4, true) === bytes.length - 8,
  );
  let offset = 12;
  let image: [number, number] | null = null;
  let canvas: [number, number] | null = null;
  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset, 4);
    const length = view.getUint32(offset + 4, true);
    const start = offset + 8;
    offset = start + length + (length & 1);
    check(offset <= bytes.length && type !== "ANIM" && type !== "ANMF");
    if (type === "VP8X") {
      check(!canvas && !image && length === 10);
      check((bytes[start] & 0xc3) === 0);
      check(
        bytes[start + 1] === 0 && bytes[start + 2] === 0 &&
          bytes[start + 3] === 0,
      );
      canvas = [
        1 + bytes[start + 4] + (bytes[start + 5] << 8) +
        (bytes[start + 6] << 16),
        1 + bytes[start + 7] + (bytes[start + 8] << 8) +
        (bytes[start + 9] << 16),
      ];
      dimensions(...canvas);
    } else if (type === "VP8 ") {
      check(!image && length >= 10 && (bytes[start] & 1) === 0);
      check(
        bytes[start + 3] === 0x9d && bytes[start + 4] === 1 &&
          bytes[start + 5] === 0x2a,
      );
      image = [
        view.getUint16(start + 6, true) & 0x3fff,
        view.getUint16(start + 8, true) & 0x3fff,
      ];
    } else if (type === "VP8L") {
      check(!image && length >= 5 && bytes[start] === 0x2f);
      const bits = view.getUint32(start + 1, true);
      check((bits >>> 29) === 0);
      image = [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
    }
  }
  check(offset === bytes.length && image);
  dimensions(...image);
  check(!canvas || (canvas[0] === image[0] && canvas[1] === image[1]));
}

function validate(bytes: Uint8Array, extension: string): void {
  check(bytes.length > 0 && bytes.length <= MEDIA_MAX_BYTES);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (extension === "png") png(bytes, view);
  else if (extension === "gif") gif(bytes, view);
  else if (extension === "webp") webp(bytes, view);
  else jpeg(bytes, view);
}

function failure(status: number): Response {
  return new Response("Media unavailable", {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'",
    },
  });
}

async function fixture(asset: string): Promise<Uint8Array> {
  const file = await Deno.open(
    new URL(`../fixtures/media/${asset}`, import.meta.url),
  );
  try {
    const stat = await file.stat();
    check(stat.isFile && stat.size > 0 && stat.size <= MEDIA_MAX_BYTES);
    const bytes = new Uint8Array(stat.size);
    let offset = 0;
    while (offset < bytes.length) {
      const read = await file.read(bytes.subarray(offset));
      check(read !== null && read > 0);
      offset += read;
    }
    return bytes;
  } finally {
    file.close();
  }
}

/** Proxy only a bounded, verified static raster. Animation is unsupported. */
export async function serveMedia(
  asset: string,
  mode: "live" | "fixture",
  fetcher: typeof fetch = fetch,
  options: { timeoutMs?: number } = {},
): Promise<Response> {
  const source = assetSource(asset);
  if (!source) return failure(404);
  const { extension, url } = source;
  const mime = MIME[extension];
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let timer: number | undefined;
  const controller = new AbortController();
  try {
    let bytes: Uint8Array;
    if (mode === "fixture") {
      bytes = await fixture(asset);
    } else {
      const deadline = new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error("Media deadline"));
        }, Math.max(1, Math.min(options.timeoutMs ?? 8000, 8000)));
      });
      const load = async (): Promise<Uint8Array> => {
        const response = await fetcher(url, {
          method: "GET",
          redirect: "error",
          credentials: "omit",
          referrerPolicy: "no-referrer",
          headers: { Accept: mime },
          signal: controller.signal,
        });
        if (response.status === 404) throw new Deno.errors.NotFound();
        check(response.status === 200 && !response.redirected);
        check(!response.url || response.url === url);
        check(
          response.headers.get("content-type")?.split(";")[0].trim()
            .toLowerCase() === mime,
        );
        const length = response.headers.get("content-length");
        check(
          length === null ||
            (/^\d+$/.test(length) && Number(length) <= MEDIA_MAX_BYTES),
        );
        check(response.body);
        reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let size = 0;
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          size += value.byteLength;
          check(size <= MEDIA_MAX_BYTES);
          chunks.push(value);
        }
        const result = new Uint8Array(size);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        return result;
      };
      bytes = await Promise.race([load(), deadline]);
    }
    validate(bytes, extension);
    return new Response(new Uint8Array(bytes).buffer, {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(bytes.length),
        "Cache-Control": "public, max-age=300",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox; default-src 'none'",
        "Cross-Origin-Resource-Policy": "same-origin",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    return failure(error instanceof Deno.errors.NotFound ? 404 : 502);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    controller.abort();
    if (reader) void reader.cancel().catch(() => {});
  }
}
