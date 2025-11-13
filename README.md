# Atlas 🗺️

A modern task management application built with the MERN stack, featuring real-time collaboration, OAuth authentication, and email verification.

**🚀 Live Demo:** [https://atlas-gl63.onrender.com](https://atlas-gl63.onrender.com)

---

## ✨ Features

- 📝 **Task Management** - Create, organise, and track tasks with an intuitive interface
- 👥 **User Authentication** - Secure login with email/password or OAuth (Google & GitHub)
- ✉️ **Email Verification** - Email verification system with Resend integration
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🔄 **Real-time Updates** - Dynamic task updates and collaboration
- 📱 **Mobile Responsive** - Works seamlessly across all devices
- 🎯 **Project Organization** - Organise tasks into projects with custom columns
- 🔒 **Secure** - JWT authentication, password hashing, and OAuth integration

---

## 🛠️ Tech Stack

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **React Hook Form** - Form validation
- **React Hot Toast** - Toast notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Passport.js** - OAuth authentication
- **JWT** - Token-based authentication
- **Resend** - Email service
- **Cloudinary** - Image & File hosting

### DevOps
- **Docker** - Containerisation
- **Render** - Hosting platform
- **MongoDB Atlas** - Cloud database

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Resend API key (for email verification)
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)
- Cloudinary account (for profile pictures)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Atlas
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up environment variables**

   Create `.env` files in both `server` and `client` directories:

   **Server `.env`:**
   ```env
   # Database
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/atlas

   # JWT & Session
   JWT_SECRET=your-super-secret-jwt-key-here
   SESSION_SECRET=your-session-secret-here

   # Server Configuration
   PORT=5001
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   SERVER_URL=http://localhost:5001

   # Email Service (Resend)
   RESEND_API_KEY=re_your_resend_api_key
   EMAIL_FROM=Atlas <noreply@yourdomain.com>

   # OAuth (optional)
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret

   # Cloudinary (for profile pictures)
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

   **Client `.env`:**
   ```env
   VITE_API_URL=http://localhost:5001
   ```

4. **Start the development servers**

   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev

   # Terminal 2 - Start frontend
   cd client
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173 (Vite default port)
   - Backend: http://localhost:5001

---

## 📖 OAuth Setup

For detailed OAuth setup instructions, see [README_OAUTH_SETUP.md](./README_OAUTH_SETUP.md)

**Quick Summary:**
- **Google OAuth**: Create OAuth 2.0 credentials
- **GitHub OAuth**: Create an OAuth App in GitHub Developer Settings
- Add the redirect URIs to match your environment (development/production)

---

## 🐳 Docker Deployment

The project includes Docker support for easy deployment.

### Development with Docker Compose
```bash
docker-compose up
```

### Production Deployment

**Build and run backend:**
```bash
cd server
docker build -t atlas-server .
docker run -p 5001:5001 --env-file .env atlas-server
```

**Build and run frontend:**
```bash
cd client
docker build -t atlas-client .
docker run -p 4173:4173 --env-file .env atlas-client
```

---

## 🌍 Production Deployment (Render)

### Environment Variables for Production

When deploying to Render, update your environment variables:

**Backend Service:**
```env
NODE_ENV=production
CLIENT_URL=https://atlas-gl63.onrender.com
SERVER_URL=https://your-backend-url.onrender.com
# ... other production variables
```

**Frontend Service:**
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

### OAuth Configuration for Production

After deployment, update your OAuth redirect URIs:
- **Google**: Add `https://your-backend-url.onrender.com/api/users/auth/google/callback`
- **GitHub**: Add `https://your-backend-url.onrender.com/api/users/auth/github/callback`

---

## 📂 Project Structure

```
Atlas/
├── client/                 # React frontend
│   ├── src/
│   │   ├── assets/        # Images, icons, etc.
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # Redux store and slices
│   │   └── index.css      # Global styles & Tailwind config
│   ├── Dockerfile
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── config/        # Configuration (Passport, etc.)
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── scripts/       # Utility scripts
│   │   ├── utils/         # Helper functions
│   │   └── index.js       # Server entry point
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml     # Docker Compose config
├── README.md              # This file
└── README_OAUTH_SETUP.md  # OAuth setup guide
```

---

## 🗄️ Database Scripts

### Clear Database
```bash
cd server
node src/scripts/clearDatabase.js
```

This will delete all users, projects, tasks, and columns from your database.

---

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ HTTP-only cookies for token storage
- ✅ Email verification for new accounts
- ✅ OAuth 2.0 integration
- ✅ Rate limiting on API endpoints
- ✅ CORS protection
- ✅ Input validation and sanitization

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

Built with ❤️ by Elsa

---

## 🐛 Known Issues & Troubleshooting

### Email Verification Not Working
- Verify `RESEND_API_KEY` is set correctly
- Check that `CLIENT_URL` points to your frontend
- For production, you need a verified domain in Resend

### OAuth Errors
- Ensure redirect URIs match exactly (including port numbers)
- Verify OAuth credentials are correct
- Check that `CLIENT_URL` and `SERVER_URL` are set correctly

### Database Connection Issues
- Verify `MONGO_URI` is correct
- Ensure MongoDB Atlas allows connections from your IP
- Check that database user has proper permissions

---

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Resend Documentation](https://resend.com/docs)
- [Passport.js Documentation](http://www.passportjs.org/docs/)
- [Render Deployment Guide](https://render.com/docs)

---

**Live Application:** [https://atlas-gl63.onrender.com](https://atlas-gl63.onrender.com)
