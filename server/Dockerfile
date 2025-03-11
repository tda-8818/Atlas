# Use a Node.js base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY server/ .

# Expose the port your Express app runs on
EXPOSE 5000

# Start the application
CMD ["npm", "run", "dev"] 