// server/index.js (or your API route file)
import express from 'express';
import Project from '../models/ProjectModel.js'; // Assuming you have a User model
import User from '../models/UserModel.js';
import UserModel from '../models/UserModel.js';

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

export const 