# SAST AI Frontend - Multi-stage Dockerfile

ARG NODE_VERSION=18
ARG NODE_IMAGE_TAG=1-1749709214

ARG UBI_VERSION=9.5

# ============================================
# Stage 1: Build the React application
# ============================================
# Reference: https://catalog.redhat.com/software/containers/ubi9/nodejs-18/62e8e7ed22d1d3c2dfe2ca01
FROM registry.access.redhat.com/ubi9/nodejs-${NODE_VERSION}:${NODE_IMAGE_TAG} AS builder

COPY package.json package-lock.json ./

RUN npm ci

COPY public/ ./public/
COPY src/ ./src/
COPY tsconfig.json ./

RUN npm run build

# ============================================
# Stage 2: Serve with Nginx
# ============================================
# Reference: https://catalog.redhat.com/software/containers/ubi9/ubi-minimal
FROM registry.access.redhat.com/ubi9/ubi-minimal:${UBI_VERSION}

RUN microdnf install -y nginx && \
    microdnf clean all

COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R 1001:0 /var/cache/nginx /var/log/nginx /var/run /etc/nginx /usr/share/nginx && \
    chmod -R g+rwX /var/cache/nginx /var/log/nginx /var/run /etc/nginx /usr/share/nginx && \
    chmod 644 /etc/nginx/nginx.conf

WORKDIR /usr/share/nginx/html

COPY --chown=1001:0 --from=builder /opt/app-root/src/build/ ./

RUN echo "window._env_ = {};" > ./env-config.js && \
    chmod 664 ./env-config.js

USER 1001

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
