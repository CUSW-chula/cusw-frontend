# Use the official Bun image as the base
FROM oven/bun:1 AS base

# Set the working directory
WORKDIR /app

# Copy the package.json and bun.lockb files
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Copy the entire project into the container
COPY . .

# Build the Next.js project with standalone output
RUN bun next build

# Production stage
FROM oven/bun:1 AS production

# Set the working directory
WORKDIR /app

# Copy the standalone server files
COPY --from=base /app/.next/standalone ./

# Copy the public folder
COPY --from=base /app/public ./public

# Copy the static files for Next.js
COPY --from=base /app/.next/static ./.next/static

# Copy package.json for runtime (if needed for runtime dependencies)
COPY --from=base /app/package.json ./

# Expose the Next.js default port
EXPOSE 3000

# Start the application using Bun
CMD ["bun", ".next/standalone/server.js"]
