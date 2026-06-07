# Dev container for the Next.js 16 headless storefront.
#
# In compose the working tree is bind-mounted over /app (live reload) while the
# image's /app/node_modules is preserved via an anonymous volume, so this image
# only needs to provide a clean dependency install + the dev server entrypoint.
FROM node:20-bookworm-slim

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=development

# Install dependencies first for better layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# App source (shadowed by the bind mount at runtime, present for standalone use).
COPY . .

EXPOSE 3000

# Bind to 0.0.0.0 so the app container's nginx can proxy to storefront:3000.
# Invoked directly (not `npm run dev`) to skip the NODE_EXTRA_CA_CERTS the npm
# script sets — the storefront reaches Magento over plain http on the Docker
# network (http://app:8181), so no TLS trust bundle is needed.
CMD ["node_modules/.bin/next", "dev", "-p", "3000", "-H", "0.0.0.0"]
