FROM denoland/deno:alpine-2.6.9 AS builder
USER root
ENV DENO_DIR=/opt/deno-cache
WORKDIR /app/explorer
COPY explorer/ /app/explorer/
COPY lib/constants/stampConstants.ts /app/lib/constants/stampConstants.ts
ARG EXPLORER_REVISION
ARG RENDER_GIT_COMMIT
RUN test "${#EXPLORER_REVISION}" -eq 40 \
    && case "$EXPLORER_REVISION" in *[!a-f0-9]*) exit 1 ;; esac \
    && { test -z "$RENDER_GIT_COMMIT" || test "$RENDER_GIT_COMMIT" = "$EXPLORER_REVISION"; } \
    && deno cache --frozen main.ts \
    && GITHUB_SHA="$EXPLORER_REVISION" deno run --frozen -A build.ts build \
    && deno eval --no-config 'const revision = Deno.env.get("EXPLORER_REVISION"); const snapshot = JSON.parse(await Deno.readTextFile("_fresh/snapshot.json")); const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(revision)); const expected = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join(""); if (snapshot.build_id !== expected) throw new Error("Fresh build identity mismatch"); console.log(JSON.stringify({revision, freshBuildId: snapshot.build_id}));'

FROM denoland/deno:alpine-2.6.9
ENV DENO_DIR=/opt/deno-cache \
    EXPLORER_HOST=0.0.0.0 \
    PORT=8007 \
    EXPLORER_DATA_MODE=fixture
ARG EXPLORER_REVISION
ENV EXPLORER_REVISION=${EXPLORER_REVISION} \
    GITHUB_SHA=${EXPLORER_REVISION}
LABEL org.opencontainers.image.revision=${EXPLORER_REVISION}
WORKDIR /app/explorer
COPY --from=builder --chown=deno:deno /opt/deno-cache /opt/deno-cache
COPY --from=builder --chown=deno:deno /app/explorer/deno.json /app/explorer/deno.lock /app/explorer/main.ts /app/explorer/fresh.gen.ts /app/explorer/fresh.config.ts /app/explorer/
COPY --from=builder --chown=deno:deno /app/explorer/components /app/explorer/components
COPY --from=builder --chown=deno:deno /app/explorer/lib /app/explorer/lib
COPY --from=builder --chown=deno:deno /app/explorer/routes /app/explorer/routes
COPY --from=builder --chown=deno:deno /app/explorer/static /app/explorer/static
COPY --from=builder --chown=deno:deno /app/explorer/fixtures /app/explorer/fixtures
COPY --from=builder --chown=deno:deno /app/explorer/_fresh /app/explorer/_fresh
COPY --from=builder --chown=deno:deno /app/lib/constants/stampConstants.ts /app/lib/constants/stampConstants.ts
USER deno
EXPOSE 8007
CMD ["run", "--cached-only", "--frozen", "--no-prompt", "--allow-read=./_fresh,./static,./fixtures,./deno.json,./deno.lock", "--allow-env=DENO_DEPLOYMENT_ID,ESBUILD_BINARY_PATH,EXPLORER_DATA_MODE,EXPLORER_HOST,EXPLORER_REVISION,FRESH_ESBUILD_LOADER,GITHUB_SHA,HOME,JSR_URL,LOCALAPPDATA,NPM_CONFIG_REGISTRY,PORT,USERPROFILE,XDG_CACHE_HOME,__FRSH_LEGACY_DEV", "--allow-net=0.0.0.0:8007", "main.ts"]
