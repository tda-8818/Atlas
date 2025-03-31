/**
 * index.js is the entry point of the server. It is the file that is run when you start the server.
 * - It is responsible for creating the server, connecting to the database, and defining the routes.
 * - Handles API endpoints for user login and signup.
 */
import express, {json} from 'express'; // Express.js used for creating the server
import cors from 'cors'; // CORS is a Connect/Express middleware for handling cross-origin requests.
import { connect } from 'mongoose'; // Mongoose used for connecting to MongoDB
import UserModel from "./models/UserModel.js";
import bcrypt from 'bcryptjs';
import path from 'path'; // Path module provides utilities for working with file and directory paths
import { fileURLToPath } from 'url'; // fileURLToPath is used to convert a URL to a file path
//import userController from './userController.js';

// Create an Express server
const app = express();
const port = 5001;

// Get the current directory using import.meta.url
const fileName = fileURLToPath(import.meta.url);
const dirName = path.dirname(fileName);

// Serve static files from the React app
app.use(express.static(path.join(dirName, '../client/dist')));
// Serve the index.html file for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(dirName, '../client/dist/index.html'));
});

// Middleware set up:

app.use(cors()); 
app.use(json()); // parse incoming JSON requests

// Connect to the MongoDB database
const MONGO_URI = "mongodb+srv://ngsweejie:CS2TMS@cs02taskmanagementsyste.ko3ct.mongodb.net/users?retryWrites=true&w=majority&appName=CS02TaskManagementSystem";
connect(MONGO_URI);

// login API endpoint - checks if email+password combination exists in the database
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        // check if user exists and password is correct
        if (user && await bcrypt.compare(password, user.password)) {
            res.json(user); // send user details if login is successful
        }
        else {
            res.status(400).json('Invalid email or password');
        }
    } catch (error) {
        res.status(400).json('Server error: ' + error);
    }
});

// const dbName = "users";
// const db = connection.useDb(dbName);

// sign up API endpoint - creates a new user in the database using data from the request body
app.post('/signup', async (req, res) => {
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
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});


const router = express.Router();

router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = {
            fullName: `${user.firstName} ${user.lastName}`,
        };

        console.log('API Response:', userData); // Log the data
        res.json(userData);
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;