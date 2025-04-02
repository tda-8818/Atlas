FROM node:18-alpine

WORKDIR /app

COPY client/package*.json ./

RUN npm install @tailwindcss/vite fullcalendar && npm install

COPY client/vite.config.js ./
COPY client/src ./src/
COPY client/index.html ./

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host"]