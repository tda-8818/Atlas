import UserModel from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const cookieOptions = {
  httpOnly: true,
  secure: false, // false for localhost development
  sameSite: 'strict', // or 'none' if cross-site
  domain: 'localhost', // Explicitly set domain
  path: '/', // Root path
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// Login controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Find user WITH password
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 2. Debug password comparison
    console.log('Comparing:', {
      input: password,
      stored: user.password,
      match: await bcrypt.compare(password, user.password)
    });

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Create token
    const token = jwt.sign(
      { id: user._id.toString() }, // Ensure string conversion
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 4. Set cookie
    res.cookie('token', token, cookieOptions);

    // 5. Send response (excluding password)
    res.json({ 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
        // Other safe fields
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Signup controller
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1. check if user exists
    const existingUser = await UserModel.findOne({email});
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists.'
      })
    }

    // 2. hash password 
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('Hashed password:', hashedPassword); // Verify output

    // 3. create user
    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

     // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // Match cookie maxAge
    );

    // 5. set http-only cookie
    res.cookie('token', token, cookieOptions);

    // 6. send response (excluding password)
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout Controller
export const logout = (req, res) => {
  try {
    // Remove the cookie without unnecessary options
    res.clearCookie('token', {
      httpOnly: true,
      secure: 'lax',
      sameSite: 'strict',
      path: '/'
    });
    console.log('User logged out, cookie cleared');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

// Get user controller
export const getMe = async (req, res) => {
  try {
    // Return minimal needed user data
    res.status(200).json({
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// user password controller
export const updatePassword = async (req, res) => {
  try {
      // receive username and plaintext password from the settings page 
      const {email, oldPassword, newPassword} = req.body
      //oldPassword and newPassword are both unhashed, plaintext passwords

      console.log("User entered old password:", oldPassword);
      console.log("User entered new password:", newPassword);

      // find if the user exists
      const existingUser = await UserModel.findOne({ email: email });
      console.log("Test User found with password", existingUser.password);
      if (!existingUser) {
          return res.status(404).json({ message: "User not found." });
      }

      // Allow a user to change their password but first get them to enter their password
      // Compare passwords -> if they enter the same password: continue, else: fail 
      // compare hashed passwords 
      const hashed_pw = existingUser.password;
      const isMatch = await bcrypt.compare(oldPassword, hashed_pw)
      
      if (!isMatch) {
          return res.status(401).json({ message: 'Incorrect Password.'})
      }

      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      // if (newPassword && newPassword.length > 0) {
      //     const newHashedPassword = await bcrypt.hash(newPassword, 10);
      //     console.log("Successfully created", newHashedPassword);
      //     const updatedUser = await UserModel.findOneAndUpdate(
      //         {email}, 
      //         {password: newHashedPassword}, 
      //         {new: true}
      //     );
      // }
      const updatedUser = await UserModel.findOneAndUpdate({email}, {password:newHashedPassword}, {new:true});
      
      console.log("Updated User found with password", updatedUser.password);

      res.status(200).json( { message: "User Updated.", user: updatedUser});

  } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Server error', error });
  }
};

export default {
  login,
  signup,
  logout,
  getMe
};