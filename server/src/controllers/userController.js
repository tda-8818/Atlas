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
      console.log("user not found");
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
      { expiresIn: '1h' }
    );

    // 4. Set cookie
    res.cookie('token', token, {
      httpOnly: true,   // Helps prevent XSS
      secure: true,     // Use in production with HTTPS
      sameSite: 'none', // Often needed when front-end is on a different domain
    });

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
          profilePic: user.profilePic
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
      sameSite: 'none',
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
      // receive username and plaintext password from the settings page 
      const {currentPassword, confirmPassword} = req.body
      //currentPassword and confirmPassword are both unhashed, plaintext passwords
      console.log("recieved token: ", req.user);

      const email = req.user.email;
      console.log(email);

      console.log("User entered old password:", currentPassword);
      console.log("User entered new password:", confirmPassword);

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
      const isMatch = await bcrypt.compare(currentPassword, hashed_pw)
      
      if (!isMatch) {
          return res.status(401).json({ message: 'Incorrect Password.'})
      }

      // hash new password
      const newHashedPassword = await bcrypt.hash(confirmPassword, 10);

      // update user password
      //const updatedUser = await UserModel.findOneAndUpdate({email}, {password:newHashedPassword}, {new:true});
      const updatedUser = await UserModel.findOne({email});
      console.log(updatedUser);


      res.status(200).json( { message: "User Updated.", user: updatedUser});

  } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Server error', error });
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

export default {
  login,
  signup,
  logout,
  getMe,
  getAllUsers,
  updatePassword,
  updateProfilePicture,
  updateMe
};