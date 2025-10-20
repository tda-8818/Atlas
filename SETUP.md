# Atlas Project Setup Guide

Complete guide to set up and run the Atlas project management application from scratch.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Cloudinary Setup (Optional)](#cloudinary-setup-optional)
4. [Server Setup](#server-setup)
5. [Client Setup](#client-setup)
6. [Running the Application](#running-the-application)
7. [Common Issues](#common-issues)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (for cloning repositories)
- A **MongoDB Atlas** account (free tier available) - [Sign up here](https://www.mongodb.com/cloud/atlas/register)

Check your installations:
```bash
node --version  # Should be v18 or higher
npm --version   # Should be 8 or higher
```

---

## MongoDB Atlas Setup

### Step 1: Create a MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create a New Cluster
1. Click **"Build a Database"** or **"Create"**
2. Choose **M0 (Free tier)** - this is perfect for development
3. Select your preferred cloud provider and region (choose one closest to you)
4. Name your cluster (e.g., "atlas-cluster")
5. Click **"Create Cluster"** (this takes 3-5 minutes)

### Step 3: Create a Database User
1. In the left sidebar, go to **"Database Access"** under Security
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication method
4. Set a username (e.g., `atlas-admin`)
5. Click **"Autogenerate Secure Password"** and **SAVE THIS PASSWORD**
6. Under "Database User Privileges", select **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Configure Network Access
1. In the left sidebar, go to **"Network Access"** under Security
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, restrict this to specific IPs
4. Click **"Confirm"**

### Step 5: Get Your Connection String
1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **Driver: Node.js** and **Version: 5.5 or later**
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<username>` and `<password>`** with your database user credentials
7. **Add your database name** after `.net/` (e.g., `atlas`):
   ```
   mongodb+srv://atlas-admin:yourpassword@cluster.mongodb.net/atlas?retryWrites=true&w=majority
   ```

---

## Cloudinary Setup (Optional)

Cloudinary is used for uploading and managing images (profile pictures, file attachments). If you don't need this feature yet, you can skip this section.

### Step 1: Create a Cloudinary Account
1. Go to [Cloudinary](https://cloudinary.com/users/register/free)
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your Credentials
1. After logging in, go to the **Dashboard**
2. You'll see your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Copy these values for your `.env` file

---

## Server Setup

### Step 1: Navigate to Server Directory
```bash
cd /Users/elsatsia/Atlas/server
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages including:
- Express.js (web framework)
- Mongoose (MongoDB ODM)
- JWT (authentication)
- Bcrypt (password hashing)
- And more...

### Step 3: Create Environment File
```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables
Open `server/.env` in your text editor and update:

```bash
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Configuration - PASTE YOUR ATLAS CONNECTION STRING HERE
MONGO_URI=mongodb+srv://atlas-admin:yourpassword@cluster.mongodb.net/atlas?retryWrites=true&w=majority

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# JWT Secret - Generate a secure random string
# Run this command to generate: openssl rand -base64 32
JWT_SECRET=your_generated_secret_here

# Cloudinary Configuration (optional - skip if not using file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**To generate a secure JWT secret:**
```bash
openssl rand -base64 32
```
Copy the output and paste it as your `JWT_SECRET`.

### Step 5: Verify Server Setup
```bash
npm run dev
```

You should see:
```
Server running with WebSocket on port 5001
Connected to MongoDB
```

If you see these messages, your server is ready! Press `Ctrl+C` to stop it.

---

## Client Setup

### Step 1: Navigate to Client Directory
Open a **new terminal window/tab** and run:
```bash
cd /Users/elsatsia/Atlas/client
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- React 19
- Vite (build tool)
- Redux Toolkit (state management)
- Tailwind CSS (styling)
- FullCalendar, Gantt charts, and more

**Note:** This may take 2-5 minutes depending on your internet speed.

### Step 3: Create Environment File
```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables
Open `client/.env` in your text editor:

```bash
# API URL - Backend server URL
VITE_API_URL=http://localhost:5001
```

For development, this should point to your local server (port 5001).

---

## Running the Application

You need **two terminal windows** - one for the server, one for the client.

### Terminal 1: Start the Server
```bash
cd /Users/elsatsia/Atlas/server
npm run dev
```

You should see:
```
Server running with WebSocket on port 5001
Connected to MongoDB
```

### Terminal 2: Start the Client
```bash
cd /Users/elsatsia/Atlas/client
npm run dev
```

You should see:
```
  VITE v6.3.5  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 3: Open the Application
Open your browser and go to:
```
http://localhost:5173
```

You should see the Atlas login/signup page!

---

## Common Issues

### Issue 1: "Cannot connect to MongoDB"
**Error:** `MongoNetworkError` or `connection error`

**Solutions:**
1. Check your `MONGO_URI` in `server/.env` is correct
2. Ensure you replaced `<username>` and `<password>` with actual credentials
3. Verify your IP address is whitelisted in MongoDB Atlas Network Access
4. Make sure you added the database name (e.g., `/atlas`) in the connection string

### Issue 2: "Port 5001 already in use"
**Error:** `EADDRINUSE: address already in use :::5001`

**Solution:**
```bash
# Find and kill the process using port 5001
lsof -ti:5001 | xargs kill -9
```

### Issue 3: "Cannot connect to backend"
**Error:** Network errors in browser console

**Solutions:**
1. Ensure the server is running on port 5001
2. Check `VITE_API_URL` in `client/.env` is `http://localhost:5001`
3. Verify CORS is configured correctly (should allow `http://localhost:5173`)

### Issue 4: "Module not found" errors
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 5: "JWT_SECRET not defined"
**Error:** JWT errors or authentication failures

**Solution:**
1. Make sure you created `server/.env` from the `.env.example`
2. Generate a secure JWT_SECRET: `openssl rand -base64 32`
3. Add it to your `server/.env` file

---

## Production Deployment (Future)

When you're ready to deploy:

### Backend (Render, Railway, or AWS)
Update `server/.env`:
```bash
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.com
```

### Frontend (Netlify, Vercel)
Update `client/.env`:
```bash
VITE_API_URL=https://your-backend-domain.com
```

Update MongoDB Atlas Network Access to allow your production server IPs.

---

## Next Steps

Once your app is running:

1. **Create your first account** - Go to signup and create a user
2. **Create a project** - Click "Add Project" on the projects page
3. **Explore features** - Try the Kanban board, Calendar, Gantt chart, and Dashboard
4. **Invite collaborators** - Add other users to your projects

---

## Getting Help

- Check the [README.md](README.md) for project overview
- Review [Common Issues](#common-issues) above
- Check server logs in Terminal 1 for backend errors
- Check browser console for frontend errors

---

## Summary of Commands

### First Time Setup
```bash
# Server
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string and secrets
npm run dev

# Client (new terminal)
cd client
npm install
cp .env.example .env
# Edit .env with VITE_API_URL=http://localhost:5001
npm run dev
```

### Daily Development
```bash
# Terminal 1: Server
cd server && npm run dev

# Terminal 2: Client
cd client && npm run dev
```

**Happy coding! 🚀**
