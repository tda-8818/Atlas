import UserModel from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  sendVerificationEmail,
  generateVerificationToken,
  hashToken
} from '../utils/emailService.js';
import passport from '../config/passport.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Use secure cookies in production
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};



// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    // 1. Find user WITH password
    const user = await UserModel.findOne({ email: sanitizedEmail }).select('+password');

    // Always use same error message to prevent user enumeration
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Create token with 7 days expiry (matching cookie)
    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Set cookie
    res.cookie('token', token, cookieOptions);

    // 5. Send response (excluding password)
    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'An error occurred during login' });
  }
};


// Signup controller
export const signup = async (req, res) => {
  try {
    console.log('Signup attempt:', {
      body: req.body,
      hasFirstName: !!req.body.firstName,
      hasLastName: !!req.body.lastName,
      hasEmail: !!req.body.email,
      hasPassword: !!req.body.password
    });

    const { firstName, lastName, email, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedFirstName = firstName.trim().charAt(0).toUpperCase() + firstName.trim().slice(1).toLowerCase();
    const sanitizedLastName = lastName.trim().charAt(0).toUpperCase() + lastName.trim().slice(1).toLowerCase();

    // Validate password strength (min 8 chars, uppercase, number)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    if (!/(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter and one number'
      });
    }

    // 1. Check if user exists
    const existingUser = await UserModel.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    // 2. Hash password with consistent salt rounds
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Generate verification token
    const { token: verificationToken, hashedToken } = generateVerificationToken();

    // 4. Create user with verification token
    const user = await UserModel.create({
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      email: sanitizedEmail,
      password: hashedPassword,
      verificationToken: hashedToken,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      emailVerified: false
    });

    // 5. Send verification email (non-blocking)
    try {
      await sendVerificationEmail({
        to: user.email,
        userName: user.firstName,
        verificationToken
      });
      console.log('Verification email sent to:', user.email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError.message);
      // Don't fail signup if email fails - user can resend later
    }

    // 6. Generate JWT token with 7 days expiry (matching cookie)
    const authToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 7. Set http-only cookie
    res.cookie('token', authToken, cookieOptions);

    // 8. Send response (excluding password)
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePic: user.profilePic,
          emailVerified: user.emailVerified
        },
      },
      message: 'Account created successfully. Please check your email to verify your account.'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'An error occurred during signup',
    });
  }
};

// Logout Controller
export const logout = (req, res) => {
  try {
    // Clear cookie with matching options
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({ message: 'Logout failed' });
  }
};

// Get user controller
export const getMe = async (req, res) => {
  try {
    // Return minimal needed user data
    res.status(201).json({
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        profilePic: req.user.profilePic
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// user password controller
export const updatePassword = async (req, res) => {
  try {
      const { currentPassword, confirmPassword } = req.body;

      // Validate input
      if (!currentPassword || !confirmPassword) {
          return res.status(400).json({ message: "Current password and new password are required" });
      }

      // Validate new password strength
      if (confirmPassword.length < 8) {
          return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }

      if (!/(?=.*[A-Z])(?=.*\d)/.test(confirmPassword)) {
          return res.status(400).json({
              message: "New password must contain at least one uppercase letter and one number"
          });
      }

      const email = req.user.email;

      // Find user with password field
      const existingUser = await UserModel.findOne({ email }).select('+password');
      if (!existingUser) {
          return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, existingUser.password);

      if (!isMatch) {
          return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Check if new password is same as old password
      const isSameAsOld = await bcrypt.compare(confirmPassword, existingUser.password);
      if (isSameAsOld) {
          return res.status(400).json({ message: 'New password must be different from current password' });
      }

      // Hash new password with consistent salt rounds (12)
      const newHashedPassword = await bcrypt.hash(confirmPassword, 12);

      // Update user password - CRITICAL FIX: Actually save the password
      const updatedUser = await UserModel.findOneAndUpdate(
          { email },
          { password: newHashedPassword },
          { new: true }
      ).select('-password');

      res.status(200).json({
          message: "Password updated successfully",
          user: updatedUser
      });

  } catch (error) {
      console.error('Update password error:', error.message);
      res.status(500).json({ message: 'Server error' });
  }
};

// Get all users in the database
export const getAllUsers = async (req, res) => {
  try {
    // Extract the 'search' query parameter (if present)
    const { search } = req.query;

    // Build a filter if there is a search query
    let filter = {};
    if (search && search.trim() !== '') {
      // Using regex to match names that start with the search term (case-insensitive)
      filter = {
        $or: [
          { firstName: { $regex: `^${search}`, $options: 'i' } },
          { lastName: { $regex: `^${search}`, $options: 'i' } }
        ]
      };
    }

    // Only return necessary fields for user selection
    const users = await UserModel.find(filter, 'firstName lastName email');
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update profile picture
export const updateProfilePicture = async (req, res) => {
  try {
    console.log('Update profile picture function called');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    console.log('req.file:', JSON.stringify(req.file, null, 2));
    console.log('req.user:', JSON.stringify(req.user, null, 2));
    
    // Get the URL of the uploaded image from Cloudinary
    const profileImageUrl = req.file.path;
    console.log('Profile image URL:', profileImageUrl);

    // Make sure req.user._id exists
    if (!req.user || !req.user._id) {
      console.log('User ID not found in request:', req.user);
      return res.status(400).json({ message: 'User ID not found' });
    }

    // Update the user's profile with the new image URL
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      { profilePic: profileImageUrl },
      { new: true }
    ).select('-password'); // Exclude the password field
    
    // Check if user was found and updated
    if (!updatedUser) {
      console.log('User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('Updated user:', updatedUser);

  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ 
      message: 'Failed to update profile picture',
      error: error.message 
    });
  }
};

export const updateMe = async (req, res) => {
  const userId = req.user._id;
  const { firstName, lastName, email } = req.body;

  const user = await UserModel.findById(userId);

  if (user) {
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (email !== undefined) user.email = email;

    const updatedUser = await user.save();
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic, // Still return the profilePic
      },
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// Verify email controller
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Hash the token to compare with stored hashed token
    const hashedToken = hashToken(token);

    // Find user with matching token and check expiry
    const user = await UserModel.findOne({
      verificationToken: hashedToken,
      verificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired verification token'
      });
    }

    // Update user to verified status and clear token
    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;
    await user.save();

    res.status(200).json({
      message: 'Email verified successfully',
      success: true
    });

  } catch (error) {
    console.error('Email verification error:', error.message);
    res.status(500).json({ message: 'An error occurred during email verification' });
  }
};

// Resend verification email controller
export const resendVerificationEmail = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const { token, hashedToken } = generateVerificationToken();

    // Set token expiry to 24 hours from now
    user.verificationToken = hashedToken;
    user.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Send verification email
    await sendVerificationEmail({
      to: user.email,
      userName: user.firstName,
      verificationToken: token
    });

    res.status(200).json({
      message: 'Verification email sent successfully',
      success: true
    });

  } catch (error) {
    console.error('Resend verification email error:', error.message);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
};

// Google OAuth handlers
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

export const googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login` }, async (err, user) => {
    if (err) {
      console.error('Google auth error:', err);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    try {
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set cookie
      res.cookie('token', token, cookieOptions);

      // Redirect to projects
      res.redirect(`${process.env.CLIENT_URL}/projects`);
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=token_generation_failed`);
    }
  })(req, res, next);
};

// GitHub OAuth handlers
export const githubAuth = passport.authenticate('github', {
  scope: ['user:email']
});

export const githubAuthCallback = (req, res, next) => {
  passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL}/login` }, async (err, user) => {
    if (err) {
      console.error('GitHub auth error:', err);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }

    try {
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set cookie
      res.cookie('token', token, cookieOptions);

      // Redirect to projects
      res.redirect(`${process.env.CLIENT_URL}/projects`);
    } catch (error) {
      console.error('GitHub auth callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/login?error=token_generation_failed`);
    }
  })(req, res, next);
};

export default {
  login,
  signup,
  logout,
  getMe,
  getAllUsers,
  updatePassword,
  updateProfilePicture,
  updateMe,
  verifyEmail,
  resendVerificationEmail,
  googleAuth,
  googleAuthCallback,
  githubAuth,
  githubAuthCallback
};
