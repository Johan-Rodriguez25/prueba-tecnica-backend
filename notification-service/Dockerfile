FROM node:20-alpine AS deps
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS build
WORKDIR /app

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/prisma ./prisma

COPY tsconfig.json tsconfig.build.json nest-cli.json eslint.config.mjs .prettierrc ./
COPY prisma.config.ts ./
COPY src ./src

RUN pnpm -s exec prisma generate
RUN pnpm -s run build
RUN pnpm prune --prod

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY package.json ./

EXPOSE 3002

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
