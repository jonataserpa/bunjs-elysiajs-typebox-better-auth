# Use the official Bun base image
FROM oven/bun:1.1.30-slim as base

# Set working directory
WORKDIR /app

# Copy only package files first for caching dependencies
COPY package.json ./

# Install dependencies
RUN bun install 

# Copy application source
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV OTEL_SERVICE_NAME=payment-api
ENV OTEL_SERVICE_VERSION=1.0.0
ENV PORT=3000
ENV HOST=0.0.0.0

# Expose port
EXPOSE 3000

# Debug: List files and check structure
RUN echo "=== Arquivos no diretório ===" && ls -la
RUN echo "=== Estrutura src ===" && ls -la src/
RUN echo "=== Verificando se index.ts existe ===" && ls -la src/index.ts

# Run the application
CMD ["bun", "run", "src/index.ts"]
