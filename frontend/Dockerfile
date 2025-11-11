FROM node:22-alpine AS base

WORKDIR /app

FROM base AS builder

COPY package.json package-lock.json* ./

RUN npm ci

COPY . .

RUN npm run build

FROM base AS runner

COPY --from=builder /app/.output .output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]

