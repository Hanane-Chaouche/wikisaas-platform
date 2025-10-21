FROM node:20-alpine

WORKDIR /app

# Copier package.json + package-lock.json si dispo
COPY package*.json ./

# Installer toutes les dépendances (incluant passport, ejs, etc.)
RUN npm install --production

# Copier le code de l'application
COPY provisionner.js ./provisionner.js


# Variables d'environnement
ENV NODE_ENV=production
EXPOSE 3000

# Lancer le serveur
CMD ["node", "provisionner.js"]
