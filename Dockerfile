# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Vite requires the VITE_ prefix for environment variables to be bundled
# ARG VITE_API_URL
# ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# DEBUG: Verify Vite's output directory
RUN ls -la /app/dist

# Stage 2: Production
FROM docker.io/library/nginx:stable-alpine

# Clean default Nginx files and copy directly to the root html folder
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 4800