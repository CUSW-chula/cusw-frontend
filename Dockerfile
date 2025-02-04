# Base Stage: Install dependencies and build the project
FROM oven/bun:1 AS base

# Set the working directory
WORKDIR /app

# Copy package.json and bun.lockb
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Copy the entire project into the container
COPY . .

# Build the Next.js project with standalone output
RUN bun next build

# Production Stage: Serve the app
FROM oven/bun:1 AS production

WORKDIR /app

# Copy the standalone server output
COPY --from=base /app/.next/standalone ./

# Copy public assets and static files
COPY --from=base /app/public ./public
COPY --from=base /app/.next/static ./.next/static

# Copy package.json for runtime dependencies (optional)
COPY --from=base /app/package.json ./

# Expose the default Next.js port
EXPOSE 3000

# Start the standalone server
CMD ["bun", "server.js"]
