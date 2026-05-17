# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Accept the arguments from docker-compose
ARG REACT_APP_API_URL

# Set them as ENV so the React build script can see them
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build
# DEBUG: This will show us if the files actually exist here
RUN ls -la /app/dist

# Stage 2: Production (Make sure your COPY command uses /app/dist)
FROM docker.io/library/nginx:stable-alpine
RUN mkdir -p /usr/share/nginx/html/erp/console
COPY --from=build /app/dist /usr/share/nginx/html/erp/console/

# DEBUG: This confirms files made it to the final stage
RUN ls -la /usr/share/nginx/html/erp/console

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4800