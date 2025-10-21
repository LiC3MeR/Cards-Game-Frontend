FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=base /app/.output ./.output
COPY --from=base /app/package*.json ./

ENV HOST=0.0.0.0
ENV PORT=3001

EXPOSE 3001

CMD ["node", ".output/server/index.mjs"]

