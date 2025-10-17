# Base Stage: Install dependencies and build the project
FROM oven/bun:latest AS base

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY . .

# Accept environment variables from GitHub Actions (Build-time only)
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG NEXTAUTH_SECRET

# Persist them into ENV for runtime
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

RUN bun next build --turbopack

# Production Stage: Serve the app
FROM oven/bun:latest AS production

WORKDIR /app

COPY --from=base /app/.next/standalone ./
COPY --from=base /app/public ./public
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/package.json ./

# Accept environment variables again in the production stage
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG NODE_ENV
ARG NEXTAUTH_SECRET
ARG IS_DEV

# Set them again so they persist
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV IS_DEV=${IS_DEV}

# ไม่ต้อง hardcode NODE_ENV และ NEXTAUTH_URL ที่นี่
# ให้ docker-compose กำหนดแทน

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
