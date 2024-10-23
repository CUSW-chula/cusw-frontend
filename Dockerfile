# Use the official Bun image as the base
FROM oven/bun:1 AS base
FROM base AS install

# Set the working directory
WORKDIR /app

# Copy the package.json and bun.lockb files
COPY package.json ./

# Install dependencies using Bun
RUN bun install

# Copy the entire project into the container
COPY . .

# Build the Next.js project
RUN bun next build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the application
CMD ["bun", "next", "start"]