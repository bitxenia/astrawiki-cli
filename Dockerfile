# Stage 1: Build
FROM node:23 AS builder

# Set working directory
WORKDIR /app

# Copy package info and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Runtime container
FROM node:23

WORKDIR /app

# Copy compiled JS + only what's needed to run the CLI
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Astrawiki ports
EXPOSE 40001
EXPOSE 40002
EXPOSE 40003
# Astrawiki CLI server port
EXPOSE 31337

RUN npm link
CMD ["astrawiki", "start", "--foreground"]
