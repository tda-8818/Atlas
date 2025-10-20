# 🚀 Quick Start Guide

Get Atlas running in 5 minutes! For detailed setup, see [SETUP.md](SETUP.md).

---

## ⚡ Prerequisites
- Node.js v18+ installed
- MongoDB Atlas account created

---

## 📝 Steps

### 1. Set Up MongoDB Atlas (2 minutes)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a **free M0 cluster**
3. Create database user (save password!)
4. Allow access from anywhere (Network Access → 0.0.0.0/0)
5. Get connection string: **Databases → Connect → Connect your application**

Your connection string looks like:
```
mongodb+srv://username:password@cluster.mongodb.net/atlas?retryWrites=true&w=majority
```

---

### 2. Server Setup (1 minute)

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `server/.env`:**
```bash
PORT=5001
NODE_ENV=development
MONGO_URI=<PASTE_YOUR_MONGODB_CONNECTION_STRING_HERE>
CLIENT_URL=http://localhost:5173
JWT_SECRET=$(openssl rand -base64 32)  # Generate this first!
```

**Generate JWT_SECRET:**
```bash
openssl rand -base64 32
```
Copy the output and paste it as `JWT_SECRET` in your `.env` file.

---

### 3. Client Setup (1 minute)

```bash
# Open a NEW terminal
cd client

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `client/.env`:**
```bash
VITE_API_URL=http://localhost:5001
```

---

### 4. Run the Application (1 minute)

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```
✅ Wait for: `Connected to MongoDB`

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```
✅ Wait for: `Local: http://localhost:5173/`

---

### 5. Open Your Browser
Go to: **http://localhost:5173**

You should see the Atlas signup page!

---

## 🎉 You're Done!

Create your first account and start using Atlas.

---

## ⚠️ Troubleshooting

**Can't connect to MongoDB?**
- Check your connection string in `server/.env`
- Make sure you replaced `<username>` and `<password>`
- Verify Network Access allows 0.0.0.0/0 in MongoDB Atlas

**Port already in use?**
```bash
lsof -ti:5001 | xargs kill -9
```

**Need more help?**
See [SETUP.md](SETUP.md) for detailed instructions.
