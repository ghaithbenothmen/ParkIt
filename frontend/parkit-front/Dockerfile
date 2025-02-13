# Use Node.js 16 as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app  

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy everything, including public, src, and other necessary files
COPY . .  

# Expose the port your app runs on
EXPOSE 5173

# Start the React development server
CMD ["npm", "run", "dev"]
