# Multi-stage Dockerfile supporting both development and production

# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start Vite dev server with hot reload
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# Build stage
FROM node:20-alpine AS build

# Accept build arguments for Vite environment variables
ARG VITE_BASE_URL

# Set them as environment variables for the build
ENV VITE_BASE_URL=$VITE_BASE_URL

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React app (env vars will be baked into the build)
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
