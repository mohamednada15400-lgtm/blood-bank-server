FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force
COPY . .

FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache tzdata su-exec curl
ENV TZ=Africa/Cairo
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

# Keep seed data separate from persistent DATA_DIR
RUN mkdir -p /app/seed && \
    if [ -f /app/data/db.json ]; then cp /app/data/db.json /app/seed/db.json; fi && \
    rm -rf /app/data && \
    chown -R node:node /app/seed

ENV NODE_ENV=production
ENV DATA_DIR=/data
EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "--max-old-space-size=256", "--gc-interval=100", "server.js"]
