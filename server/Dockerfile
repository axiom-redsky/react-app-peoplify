FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
# 서버 시작 전 DB 마이그레이션만 자동 실행 (seed는 매 시작마다 데이터를 초기화하므로 제외 — 최초 1회만 수동 실행)
CMD ["sh", "-c", "npx knex migrate:latest && node src/index.js"]
