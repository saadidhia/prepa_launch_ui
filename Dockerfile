# Use Node.js as the base image
FROM node:17-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Install env-cmd globally
RUN npm install -g env-cmd

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build-dev

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["npm", "run", "start-dev"]