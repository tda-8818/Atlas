// server/index.js (or your API route file)
import express from 'express';
import Project from '../models/ProjectModel.js'; // Assuming you have a User model
import UserModel from '../models/UserModel.js';
import bcrypt from 'bcrypt';

export const createUser = async (req, res) => {
    try {
        
        // check if user already exists using unqiue email
        const existingUser = await UserModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json('User already exists');
        }

        // create a new user in the database
        const newUser = await UserModel(req.body);
        await newUser.save();
        res.status(201).json('User created successfully');
    }
    catch (error) {
        res.status(400).json('Error: ' + error);
    }
}

export const editUser = async (req, res) => {
    try {
        // receive username and plaintext password from the settings page 
        const {email, password, } = req.body

        // find if the user exists
        const existingUser = await UserModel.findOne(email);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // Allow a user to change their password but first get them to enter their password
        // Compare passwords -> if they enter the same password: continue, else: fail 
        const plaintext_password = password
        // compare hashed passwords 
        const hashed_pw = existingUser.password;
        const isMatch = await bcrypt.compare(plaintext_password, hashed_pw)
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect Password.'})
        }

        if (plaintext_password && plaintext_password.length > 0) {
            const newHashedPassword = await bcrypt.hash(plaintext_password, 10);
            
            const updatedUser = await UserModel.findOneAndUpdate(
                {email}, 
                {password: newHashedPassword}, 
                {new: true}
            );
            return res.status(200).json( { message: "User Updated.", user: updatedUser});
        }
        return res.status(400).json({message: 'user did not update.'})
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Server error', error });
    }
};