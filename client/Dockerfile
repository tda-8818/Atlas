FROM node:18-alpine

WORKDIR /app

COPY client/package*.json ./

RUN npm install

COPY client/ .

RUN npm run build
RUN npm install @tailwindcss/vite

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host"]