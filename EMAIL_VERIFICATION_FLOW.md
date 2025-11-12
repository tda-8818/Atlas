# Email Verification Flow - Atlas

This document explains the complete email verification process in the Atlas application.

---

## 📧 Overview

Email verification is a security feature that ensures users have access to the email address they sign up with. It's required for collaboration features and helps prevent spam accounts.

---

## 🔄 The Complete Flow

### **Step 1: User Signs Up**

**File**: [`client/src/pages/Signup.jsx`](client/src/pages/Signup.jsx#L57-L68)

1. User fills out signup form (name, email, password)
2. Frontend sends signup request to backend
3. User is **immediately redirected to `/projects`** (can use app right away!)
4. Toast notification shows: "Please check your email to verify your account"

**Key Points:**
- ✅ Users can access the app immediately after signup
- ✅ No blocking wait for email verification
- ✅ Verification enables additional collaboration features

---

### **Step 2: Backend Creates Account & Sends Email**

**File**: [`server/src/controllers/userController.js`](server/src/controllers/userController.js#L77-L146)

1. Backend validates user data
2. Hashes password with bcrypt
3. Generates verification token:
   - Creates random 32-byte token
   - Hashes token with SHA256 for database storage
   - Sets 24-hour expiry
4. Saves user to database with `emailVerified: false`
5. Sends JWT auth cookie (user is logged in!)
6. **Non-blocking**: Sends verification email via Resend
   - If email fails, signup still succeeds
   - User can request new email from Settings

---

### **Step 3: User Receives Verification Email**

**File**: [`server/src/utils/emailService.js`](server/src/utils/emailService.js#L263-L280)

User receives a beautifully formatted email with:
- Atlas branding
- Welcome message with their name
- "Verify Email Address" button
- Manual verification link (if button doesn't work)
- 24-hour expiry notice

**Example Link Format:**
```
https://atlas-gl63.onrender.com/verify-email/abc123def456...
```

---

### **Step 4: User Clicks Verification Link**

**File**: [`client/src/pages/VerifyEmail.jsx`](client/src/pages/VerifyEmail.jsx)

1. User lands on `/verify-email/:token` page
2. Page shows loading spinner: "Verifying your email..."
3. Frontend sends token to backend API
4. Three possible outcomes:

#### ✅ **Success**
- Green checkmark displayed
- "Email Verified!" message
- Auto-redirects to `/projects` after 3 seconds
- Backend updates: `emailVerified: true`

#### ❌ **Error - Token Invalid/Expired**
- Red X displayed
- "Verification Failed" message
- Option to go to Projects
- Option to go to Login
- Hint: "Request a new verification email from your account settings"

#### ⏳ **Verifying**
- Loading spinner
- "Verifying your email..." message

---

### **Step 5: Backend Verifies Token**

**File**: [`server/src/controllers/userController.js`](server/src/controllers/userController.js#L382-L421)

1. Receives token from URL
2. Hashes the received token
3. Searches database for matching hashed token
4. Checks if token is expired (< 24 hours old)
5. If valid:
   - Sets `emailVerified: true`
   - Clears `verificationToken` and `verificationTokenExpiry`
   - Returns success response
6. If invalid/expired:
   - Returns error response

---

### **Step 6: Resending Verification Email (Optional)**

**Files**:
- [`client/src/pages/Settings.jsx`](client/src/pages/Settings.jsx#L231-L269) (UI)
- [`server/src/controllers/userController.js`](server/src/controllers/userController.js#L423-L463) (Backend)

If user didn't receive email or it expired:

1. User goes to **Settings page**
2. Sees "Email Verification" section with warning icon
3. Clicks "Resend Verification Email" button
4. Backend:
   - Checks if email is already verified
   - Generates new verification token
   - Updates database with new token & expiry
   - Sends new verification email
5. User receives fresh email with new 24-hour link

---

## 🎨 What the User Sees

### **Unverified Account (Settings Page)**

```
📧 Email Verification
┌─────────────────────────────────────────────────────────┐
│ ⚠️  Email Not Verified                  [Resend Email]  │
│     Please verify your email to enable collaboration    │
│     features                                             │
└─────────────────────────────────────────────────────────┘
```

### **Verified Account (Settings Page)**

```
📧 Email Verification
┌─────────────────────────────────────────────────────────┐
│ ✅  Email Verified                                       │
│     Your email address has been verified                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Features

1. **Token Hashing**: Raw tokens never stored in database
2. **Time-Limited**: 24-hour expiry prevents old links from working
3. **One-Time Use**: Token cleared after successful verification
4. **JWT Authentication**: Separate from email verification
5. **Non-Blocking**: Email failures don't prevent signup

---

## 🛠️ Technical Implementation

### **Frontend Components**

| File | Purpose |
|------|---------|
| [`Signup.jsx`](client/src/pages/Signup.jsx) | Signup form & immediate redirect |
| [`VerifyEmail.jsx`](client/src/pages/VerifyEmail.jsx) | Verification page with token handling |
| [`Settings.jsx`](client/src/pages/Settings.jsx#L231-L269) | Shows verification status & resend button |

### **Backend Endpoints**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/users/signup` | POST | Create account & send verification |
| `/api/users/verify-email/:token` | GET | Verify email with token |
| `/api/users/resend-verification` | POST | Send new verification email |

### **Redux Slice**

| Mutation | Purpose |
|----------|---------|
| `useSignupMutation` | Signup user |
| `useResendVerificationEmailMutation` | Resend verification |

---

## 📝 Database Schema

**User Model Fields:**
```javascript
{
  email: String,
  emailVerified: Boolean,              // Default: false
  verificationToken: String,            // Hashed token
  verificationTokenExpiry: Date,        // 24 hours from creation
  // ... other fields
}
```

**OAuth Users:**
- OAuth signups (Google/GitHub) automatically have `emailVerified: true`
- Email is already verified by the OAuth provider

---

## 🎯 Why This Approach?

### **Immediate Access**
✅ Users don't wait for email verification
✅ Can start using the app right away
✅ Better user experience & conversion

### **Security**
✅ Prevents spam accounts (eventually)
✅ Enables collaboration features safely
✅ Email ownership confirmed

### **Flexibility**
✅ Users can resend email if needed
✅ Clear verification status in Settings
✅ Non-blocking email delivery

---

## 🚀 Testing the Flow

### **Development**

1. Start backend: `cd server && npm run dev`
2. Start frontend: `cd client && npm run dev`
3. Sign up with a test email
4. Check server console for verification link
5. Click link to verify

### **Production**

1. Ensure `RESEND_API_KEY` is set
2. Configure `EMAIL_FROM` with verified domain
3. Set `CLIENT_URL` to production URL
4. Test signup → email → verification

---

## 🐛 Troubleshooting

### **Not Receiving Emails**

**Check**:
1. `RESEND_API_KEY` is valid
2. `CLIENT_URL` points to correct URL
3. Server logs for email errors
4. Resend dashboard for delivery status
5. Email not in spam folder

**Solution**:
- Use "Resend Verification Email" button in Settings
- Check server console logs
- Verify Resend API key is active

### **Token Invalid/Expired**

**Causes**:
- Link older than 24 hours
- Link already used
- Database was cleared

**Solution**:
- Request new verification email from Settings

### **Verification Link Not Working**

**Check**:
1. Link format: `CLIENT_URL/verify-email/:token`
2. Frontend route configured in App.jsx
3. Backend endpoint accessible

---

## 📚 Related Files

- Email Templates: [`server/src/utils/emailService.js`](server/src/utils/emailService.js)
- User Controller: [`server/src/controllers/userController.js`](server/src/controllers/userController.js)
- User Routes: [`server/src/routes/userRoutes.js`](server/src/routes/userRoutes.js)
- Redux Slice: [`client/src/redux/slices/userSlice.js`](client/src/redux/slices/userSlice.js)

---

## 🎓 For Developers

### **Adding Verification Requirements**

To require verification for a feature:

```javascript
// Backend middleware
if (!req.user.emailVerified) {
  return res.status(403).json({
    message: 'Please verify your email to use this feature'
  });
}
```

### **Customizing Email Template**

Edit [`server/src/utils/emailService.js`](server/src/utils/emailService.js#L42-L143) to customize:
- Email design
- Button styles
- Branding
- Copy text

---

**Need Help?** Check the [main README](README.md) or [OAuth Setup Guide](README_OAUTH_SETUP.md)
