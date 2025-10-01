FROM node:20-alpine

WORKDIR /app

# Install prod deps first (layer cache)
COPY package.json ./
RUN npm ci --only=production

# Copy app code
COPY server.js ./server.js
COPY public ./public

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
