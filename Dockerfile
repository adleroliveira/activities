# Build stage
FROM node:18-alpine as builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/backend/package.json ./packages/backend/

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build frontend and backend
RUN pnpm build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built backend and frontend
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/frontend/dist ./frontend/dist
COPY --from=builder /app/packages/backend/package.json ./

# Install production dependencies only
RUN npm install --production

EXPOSE 3000

CMD ["node", "dist/index.js"]
