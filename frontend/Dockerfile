FROM node:20-alpine AS builder

LABEL stage="builder"

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner

LABEL maintainer="CineRent"
LABEL description="React frontend served by Nginx"

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
