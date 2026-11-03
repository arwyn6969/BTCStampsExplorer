import type { Stamp } from "../lib/adapter.ts";
import { mediaAsset } from "../lib/media.ts";

interface StampArtProps {
  stamp: Stamp;
  priority?: boolean;
}

export function StampArt({ stamp, priority = false }: StampArtProps) {
  const asset = mediaAsset(stamp.mediaUrl);
  const unsupported = stamp.mime &&
    !["image/png", "image/jpeg", "image/gif", "image/webp"].includes(
      stamp.mime,
    );
  return (
    <div class={`artwork${asset ? "" : " unavailable"}`}>
      <div
        class="artwork-fallback"
        role="img"
        aria-label={`Artwork unavailable for stamp ${stamp.id}`}
      >
        <span class="placeholder-mark" aria-hidden="true">✳</span>
        <span>
          {unsupported
            ? "Preview unavailable for this format"
            : "Artwork unavailable"}
        </span>
        {unsupported && <small>{stamp.mime}</small>}
      </div>
      {asset && (
        <img
          src={`/media/${asset}`}
          alt={`Bitcoin Stamp #${stamp.id}${
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
