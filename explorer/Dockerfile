FROM denoland/deno:alpine-2.6.9 AS builder
USER root
ENV DENO_DIR=/opt/deno-cache
WORKDIR /app/explorer
COPY explorer/ /app/explorer/
COPY lib/constants/stampConstants.ts /app/lib/constants/stampConstants.ts
RUN deno cache --frozen main.ts && deno run --frozen -A build.ts build

FROM denoland/deno:alpine-2.6.9
ENV DENO_DIR=/opt/deno-cache \
    EXPLORER_HOST=0.0.0.0 \
    PORT=8007 \
    EXPLORER_DATA_MODE=live
ARG EXPLORER_REVISION=unknown
ENV EXPLORER_REVISION=${EXPLORER_REVISION}
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
CMD ["run", "--cached-only", "--frozen", "--no-prompt", "--allow-read=./_fresh,./static,./fixtures,./deno.json,./deno.lock", "--allow-env=DENO_DEPLOYMENT_ID,ESBUILD_BINARY_PATH,EXPLORER_DATA_MODE,EXPLORER_HOST,EXPLORER_REVISION,FRESH_ESBUILD_LOADER,GITHUB_SHA,HOME,JSR_URL,LOCALAPPDATA,NPM_CONFIG_REGISTRY,PORT,USERPROFILE,XDG_CACHE_HOME,__FRSH_LEGACY_DEV", "--allow-net=0.0.0.0:8007,stampchain.io:443", "main.ts"]
