import type { Stamp } from "../lib/adapter.ts";
import { htmlPreviewAsset, mediaAsset } from "../lib/media.ts";

interface StampArtProps {
  stamp: Stamp;
  priority?: boolean;
}

export function StampArt({ stamp, priority = false }: StampArtProps) {
  const html = stamp.mime === "text/html";
  const asset = html ? htmlPreviewAsset(stamp.id) : mediaAsset(stamp.mediaUrl);
  const unsupported = stamp.mime &&
    !["image/png", "image/jpeg", "image/gif", "image/webp", "text/html"]
      .includes(
        stamp.mime,
      );
  return (
    <div
      class={`artwork${asset ? "" : " unavailable"}`}
      data-preview={html ? "existing-static-png" : undefined}
    >
      <div
        class="artwork-fallback"
        role="img"
        aria-label={`${
          html ? "HTML preview" : "Artwork"
        } unavailable for stamp ${stamp.id}`}
      >
        <span class="placeholder-mark" aria-hidden="true">✳</span>
        <span>
          {html
            ? "HTML preview unavailable"
            : unsupported
            ? "Preview unavailable for this format"
            : "Artwork unavailable"}
        </span>
        {unsupported && <small>{stamp.mime}</small>}
      </div>
      {asset && (
        <img
          src={`/media/${asset}`}
          alt={`${html ? "HTML preview of " : ""}Bitcoin Stamp #${stamp.id}${
            stamp.name ? `: ${stamp.name}` : ""
          }`}
          width="320"
          height="320"
          loading={priority ? "eager" : "lazy"}
          fetchpriority={priority ? "high" : "auto"}
          decoding="async"
        />
      )}
    </div>
  );
}
