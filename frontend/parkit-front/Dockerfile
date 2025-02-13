# Use Node.js 16 as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /src

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the React development server
CMD ["npm", "run", "dev"]