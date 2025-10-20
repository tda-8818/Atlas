# 🐳 Docker Quick Reference

## Setup (One Time)

```bash
# 1. Create .env files
cd server && cp .env.example .env
cd ../client && cp .env.example .env

# 2. Edit server/.env - add MongoDB connection string
# 3. Build containers
docker-compose build
```

---

## Daily Commands

```bash
# Start everything
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

---

## When Things Break

```bash
# Restart everything
docker-compose restart

# Rebuild everything
docker-compose up --build

# Nuclear option (clean slate)
docker-compose down
docker system prune -a
docker-compose up --build
```

---

## Access Points

- Frontend: http://localhost:4173
- Backend: http://localhost:5001

Done! 🚀