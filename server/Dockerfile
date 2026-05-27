FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
# 서버 시작 전 DB 마이그레이션 자동 실행
CMD ["sh", "-c", "npx knex migrate:latest && node src/index.js"]
