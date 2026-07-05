FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV DATA_DIR=/data
ENV PORT=3001

RUN chmod +x /app/entrypoint.sh

EXPOSE 3001

CMD ["/app/entrypoint.sh"]
