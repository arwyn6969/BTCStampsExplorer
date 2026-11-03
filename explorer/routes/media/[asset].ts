import type { Handlers } from "$fresh/server.ts";
import { dataMode } from "../../lib/data.ts";
import { serveMedia } from "../../lib/media.ts";

export const handler: Handlers = {
  GET(_request, context) {
    return serveMedia(context.params.asset, dataMode);
  },
};
