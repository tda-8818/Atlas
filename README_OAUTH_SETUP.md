# OAuth Setup Guide

This guide will help you set up Google and GitHub OAuth authentication for your Atlas application.

## Prerequisites

1. Google Cloud Console account
2. GitHub account
3. Your application running on a publicly accessible URL (for production)

## Google OAuth Setup

### 1. Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one

### 2. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen if prompted:
   - User Type: External
   - App name: Atlas (or your app name)
   - User support email: Your email
   - Developer contact information: Your email
   - Scopes: Add `email` and `profile` (these are usually pre-selected)
4. Choose "Web application" as application type
5. Add authorized redirect URIs:
   - For development: `http://localhost:5001/api/users/auth/google/callback`
   - For production: `https://yourdomain.com/api/users/auth/google/callback`
6. Save and copy the Client ID and Client Secret

## GitHub OAuth Setup

### 1. Create a GitHub OAuth App
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - Application name: Atlas (or your app name)
   - Homepage URL: Your app's homepage
   - Authorization callback URL:
     - For development: `http://localhost:5001/api/users/auth/github/callback`
     - For production: `https://yourdomain.com/api/users/auth/github/callback`
4. Click "Register application"
5. Copy the Client ID and generate/copy the Client Secret


## Testing OAuth

1. Start your server: `cd server && npm run dev`
2. Start your client: `cd client && npm run dev`
3. Go to the login or signup page
4. Click the Google or GitHub button
5. You should be redirected to the OAuth provider, then back to your app

## Production Deployment

When deploying to production:

1. Update the redirect URIs in Google and GitHub OAuth apps to use your production domain
2. Set `NODE_ENV=production` in your server environment
3. Ensure `CLIENT_URL` and `SERVER_URL` are set to your production URLs
4. Use strong, unique secrets for `JWT_SECRET` and `SESSION_SECRET`

## Troubleshooting

### Common Issues:

1. **Redirect URI mismatch**: Ensure the redirect URIs in OAuth apps match exactly
2. **CORS errors**: Make sure your `CLIENT_URL` is correctly set
3. **Session errors**: Ensure `SESSION_SECRET` is set
4. **MongoDB connection**: Ensure your database is running and accessible

### Debug Tips:

1. Check server logs for OAuth-related errors
2. Verify environment variables are loaded correctly
3. Test OAuth flows in incognito mode to avoid cookie issues
4. Ensure your server is accessible from the internet for OAuth callbacks

## Security Notes

- Never commit OAuth secrets to version control
- Use HTTPS in production
- Regularly rotate your OAuth secrets
- Monitor your OAuth app usage in Google Cloud Console and GitHub
