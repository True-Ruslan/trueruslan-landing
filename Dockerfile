FROM nginx:1.27-alpine
EXPOSE 8080
COPY docs-html /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
