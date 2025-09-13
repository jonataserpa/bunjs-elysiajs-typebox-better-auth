# Use a imagem oficial do Bun
FROM oven/bun:1.0.29-alpine

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema necessárias para OpenTelemetry
RUN apk add --no-cache \
    ca-certificates \
    curl \
    && rm -rf /var/cache/apk/*

# Copiar arquivos de configuração do package
COPY package.json bun.lockb ./

# Instalar dependências
RUN bun install --frozen-lockfile

# Copiar código fonte
COPY . .

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S bunjs -u 1001

# Mudar ownership dos arquivos para o usuário bunjs
RUN chown -R bunjs:nodejs /app
USER bunjs

# Expor porta
EXPOSE 3000

# Variáveis de ambiente para OpenTelemetry
ENV NODE_ENV=production
ENV OTEL_SERVICE_NAME=payment-api
ENV OTEL_SERVICE_VERSION=1.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando para iniciar a aplicação
CMD ["bun", "run", "start"]
