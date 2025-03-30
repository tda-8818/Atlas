# Use a Node.js base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY server/package*.json ./

# Install dependencies
RUN npm install nodemon cors bcryptjs jsonwebtoken express mongoose dotenv

# Copy the rest of the application code
COPY server/ .

# Expose the port your Express app runs on
EXPOSE 5001

# Start the application
CMD ["nodemon", "index.js"]