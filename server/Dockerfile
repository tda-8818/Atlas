# Use a Node.js base image
FROM node:18-alpine

# Install build dependencies for native modules (bcrypt, etc)
RUN apk add --no-cache python3 make g++

# Set the working directory in the container
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (use ci for faster, reproducible builds)
# The --prefer-offline flag speeds up installs
RUN npm ci --prefer-offline --no-audit || npm install --prefer-offline --no-audit

# Copy the rest of the application code
COPY . .

# Expose the port your Express app runs on
EXPOSE 5001

# Start the application with the correct entry point
CMD ["npm", "run", "dev"]