FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (use ci for faster builds)
# The --prefer-offline and --no-audit flags speed up installs
RUN npm ci --prefer-offline --no-audit || npm install --prefer-offline --no-audit

# Copy configuration and source files
COPY vite.config.js ./
COPY eslint.config.js* ./
COPY src ./src/
COPY index.html ./
COPY index.css* ./

# Build the application
RUN npm run build

# Expose port
EXPOSE 4173

# Start the preview server
CMD ["npm", "run", "preview", "--", "--host"]