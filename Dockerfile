# syntax=docker/dockerfile:1
FROM --platform=linux/x86_64 node:12-alpine
RUN apk add --no-cache python2 g++ make
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . .
CMD ["node", "src/index.js"]
EXPOSE 3000