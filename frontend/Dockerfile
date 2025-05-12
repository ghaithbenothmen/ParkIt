# Utiliser l'image Node.js officielle
FROM node:18

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du projet
COPY . .

# Exposer le bon port pour create-react-app
EXPOSE 3000

# Démarrer l'application React
CMD ["npm", "start"]