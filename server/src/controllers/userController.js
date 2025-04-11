import UserModel from '../models/UserModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {generateSecretKey} from '../util/generateSecretKey.js'; // Import the function to generate a secret key

// Generate a secret key for JWT
const secretKey = generateSecretKey(); // Generate a new secret key

// Login controller
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            // Generate JWT
            const token = jwt.sign(
                { userId: user._id },
                secretKey, // Use the generated secret key
                { expiresIn: '1h' } // Token expires in 1 hour
            );

            res.json({ token, user: { _id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName } }); // Send token and user details
        } else {
            res.status(400).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// Signup controller
export const signup = async (req, res) => {
    try {
        const existingUser = await UserModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const newUser = new UserModel(req.body);
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message.includes('duplicate') ? error.message : 'Invalid registration data' });
    }
};

// Get user controller
export const getUser = async (req, res) => {
    try {
        const userId = req.user.userId; // Get userId from the decoded JWT
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = {
            fullName: `${user.firstName} ${user.lastName}`,
        };

        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export default {
    login,
    signup,
    getUser,
};