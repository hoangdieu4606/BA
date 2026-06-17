# Stage 1: Build the frontend React app
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Set up the backend server and production assets
FROM node:22-alpine
WORKDIR /app

# Copy backend dependencies and install them
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend assets from Stage 1 into the backend's expected directory
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port and start
EXPOSE 5000
ENV PORT=5000
CMD ["node", "backend/src/server.js"]
