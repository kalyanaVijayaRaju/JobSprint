FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system jobsprint && adduser --system --ingroup jobsprint jobsprint

COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src

USER jobsprint

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/health/live').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
