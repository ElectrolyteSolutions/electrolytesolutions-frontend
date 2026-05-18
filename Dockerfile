# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# ARG VITE_API_URL
# ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Production
FROM docker.io/library/nginx:stable-alpine

# Create the nested directory structure matching your reverse proxy path
RUN mkdir -p /usr/share/nginx/html/erp/console

# Copy the build files into that exact nested directory
COPY --from=build /app/dist /usr/share/nginx/html/erp/console/

# Copy the internal Nginx configuration (We will create this in Step 3)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4800