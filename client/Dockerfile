FROM node:18-alpine

WORKDIR /app

COPY client/package*.json ./

RUN npm install

COPY client/ .

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host"]