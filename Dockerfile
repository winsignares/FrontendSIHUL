# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

# Install deps first for better caching
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy remaining source and build
COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:alpine AS runtime

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx config for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
