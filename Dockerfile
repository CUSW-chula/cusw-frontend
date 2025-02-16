# Base Stage: Install dependencies and build the project
FROM oven/bun:1 AS base

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install

COPY . .

# Accept environment variables from GitHub Actions (Build-time only)
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG AUTH_SECRET

# Persist them into ENV for runtime
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV AUTH_SECRET=${AUTH_SECRET}

RUN bun next build

# Production Stage: Serve the app
FROM oven/bun:1 AS production

WORKDIR /app

COPY --from=base /app/.next/standalone ./
COPY --from=base /app/public ./public
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/package.json ./

# Accept environment variables again in the production stage
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG AUTH_SECRET

# Set them again so they persist
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV AUTH_SECRET=${AUTH_SECRET}

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
