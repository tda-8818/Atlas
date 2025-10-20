# 🐳 Docker Setup Guide for Atlas

Run the entire Atlas application in Docker containers.

---

## Prerequisites

- **Docker Desktop** installed - [Download here](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (comes with Docker Desktop)
- **MongoDB Atlas** account with connection string

Check your installation:
```bash
docker --version
docker-compose --version
```

---

## Quick Start

### 1. Create Environment Files

**Server .env:**
```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```bash
PORT=5001
NODE_ENV=development
MONGO_URI=your_mongodb_atlas_connection_string_here
CLIENT_URL=http://localhost:4173
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Client .env:**
```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:
```bash
VITE_API_URL=http://localhost:5001
```

---

### 2. Build and Run Containers

From the project root:

```bash
# Build the containers (first time only or after Dockerfile changes)
docker-compose build

# Start all services
docker-compose up
```

Or do both in one command:
```bash
docker-compose up --build
```

---

### 3. Access the Application

- **Frontend**: http://localhost:4173
- **Backend API**: http://localhost:5001

---

## Docker Commands Cheat Sheet

### Starting Services
```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached mode)
docker-compose up -d

# Start and rebuild images
docker-compose up --build

# Start specific service only
docker-compose up server
```

### Stopping Services
```bash
# Stop all services (graceful shutdown)
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Stop specific service
docker-compose stop server
```

### Viewing Logs
```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs server
docker-compose logs client

# Last 100 lines
docker-compose logs --tail=100
```

### Managing Containers
```bash
# List running containers
docker-compose ps

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart server

# Execute command in running container
docker-compose exec server sh
docker-compose exec client sh
```

### Cleaning Up
```bash
# Remove stopped containers
docker-compose rm

# Remove all containers, networks, images, and volumes
docker-compose down --rmi all --volumes

# Prune unused Docker resources
docker system prune -a
```

---

## Development Workflow

### Hot Reloading

Both client and server support hot reloading:

- **Server**: Uses `nodemon` - changes in `server/src/` auto-restart
- **Client**: Uses Vite HMR - changes in `client/src/` auto-refresh

### Making Changes

1. Edit files in `client/src/` or `server/src/`
2. Changes are automatically detected
3. No need to rebuild containers!

### When to Rebuild

Rebuild containers when you:
- Add new npm packages
- Change Dockerfile
- Change docker-compose.yml
- Need a fresh start

```bash
docker-compose down
docker-compose up --build
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│           Docker Compose                │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Client     │    │   Server     │  │
│  │   (Vite)     │◄───┤  (Express)   │  │
│  │ Port: 4173   │    │ Port: 5001   │  │
│  └──────────────┘    └──────┬───────┘  │
│                              │          │
└──────────────────────────────┼──────────┘
                               │
                               ▼
                      ┌────────────────┐
                      │  MongoDB Atlas │
                      │    (Cloud)     │
                      └────────────────┘
```

---

## Environment Variables

### Server (server/.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment | `development` or `production` |
| `MONGO_URI` | MongoDB connection | `mongodb+srv://...` |
| `CLIENT_URL` | Frontend URL (CORS) | `http://localhost:4173` |
| `JWT_SECRET` | JWT signing key | Generate with `openssl rand -base64 32` |
| `CLOUDINARY_*` | File upload config | From Cloudinary dashboard |

### Client (client/.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5001` |

---

## Troubleshooting

### Issue: Port already in use

**Error:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:5001: bind: address already in use
```

**Solution:**
```bash
# Find and kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or change port in docker-compose.yml
ports:
  - "5002:5001"  # Use port 5002 instead
```

---

### Issue: Cannot connect to MongoDB

**Error:** `MongoNetworkError` in server logs

**Solutions:**
1. Verify `MONGO_URI` in `server/.env` is correct
2. Check MongoDB Atlas Network Access allows all IPs (0.0.0.0/0)
3. Ensure connection string has database name: `...mongodb.net/atlas?...`

---

### Issue: Changes not reflecting

**Solution:**
```bash
# Restart containers
docker-compose restart

# Or rebuild if you changed dependencies
docker-compose up --build
```

---

### Issue: Out of disk space

**Solution:**
```bash
# Remove unused images, containers, and volumes
docker system prune -a --volumes

# Warning: This deletes ALL unused Docker data
```

---

### Issue: Container keeps restarting

**Solution:**
```bash
# Check logs for errors
docker-compose logs server

# Common causes:
# - Missing .env file
# - Invalid environment variables
# - Syntax errors in code
```

---

## Production Deployment

For production, modify `docker-compose.yml`:

```yaml
services:
  server:
    environment:
      - NODE_ENV=production
      - CLIENT_URL=https://your-domain.com
    restart: always

  client:
    environment:
      - VITE_API_URL=https://api.your-domain.com
    restart: always
```

Use environment-specific files:
- `docker-compose.yml` - Base configuration
- `docker-compose.prod.yml` - Production overrides

Deploy with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Best Practices

1. **Never commit .env files** - They contain secrets!
2. **Use .env.example** as a template
3. **Keep Docker images updated** - `docker-compose pull`
4. **Monitor logs** - `docker-compose logs -f`
5. **Clean up regularly** - `docker system prune`
6. **Use volumes for data** - Persists between container restarts
7. **Limit resources** - Add memory/CPU limits in production

---

## Summary

```bash
# Quick Start (first time)
docker-compose build
docker-compose up

# Daily Development
docker-compose up -d       # Start in background
docker-compose logs -f     # Watch logs
docker-compose down        # Stop when done

# Troubleshooting
docker-compose restart     # Restart services
docker-compose up --build  # Rebuild and restart
docker system prune        # Clean up space
```

**Your Atlas app is now containerized! 🐳**