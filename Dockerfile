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
ARG NEXT_PUBLIC_IS_DEV

# Persist them into ENV for runtime
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXT_PUBLIC_IS_DEV=${NEXT_PUBLIC_IS_DEV}

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
ARG NEXT_PUBLIC_IS_DEV
ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY

# Set them again so they persist
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXT_PUBLIC_IS_DEV=${NEXT_PUBLIC_IS_DEV}
ENV NODE_ENV=production
ENV NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=${NEXT_SERVER_ACTIONS_ENCRYPTION_KEY}

# NEXTAUTH_URL ไม่ hardcode ที่นี่ - ให้ docker-compose กำหนดแทน
# เพื่อให้สามารถ override ได้ตอน runtime

EXPOSE 3000

# HOSTNAME 0.0.0.0 ใช้สำหรับ binding port เท่านั้น
# NextAuth จะใช้ NEXTAUTH_URL จาก environment variable แทน
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["bun", "server.js"]
