FROM node:20-slim
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .
ENV DATA_DIR=/app/data
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "server.js"]
