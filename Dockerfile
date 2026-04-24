# Stage 1 — build
FROM node:lts-alpine AS builder

ARG VITE_API_URL
ARG VITE_GRAPHQL_URL
ARG VITE_GITHUB_CLIENT_ID

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN VITE_API_URL=$VITE_API_URL VITE_GRAPHQL_URL=$VITE_GRAPHQL_URL VITE_GITHUB_CLIENT_ID=$VITE_GITHUB_CLIENT_ID npm run build


# Stage 2 — serve
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
