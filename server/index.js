/**
 * index.js is the entry point of the server. It is the file that is run when you start the server.
 * It is responsible for creating the server, connecting to the database, and defining the routes.
 * Handles API endpoints for user login and signup.
 */

// Importing required modules
import express, { json } from 'express'; // Express.js used for creating the server
import { connect } from 'mongoose'; // Mongoose used for connecting to MongoDB
import cors from 'cors'; // CORS is a Connect/Express middleware for handling cross-origin requests.
import User from "./models/User.js";

// Create an Express server
const app = express();
const port = 5001;

// Middleware set up:

app.use(cors());
app.use(json()); // parse incoming JSON requests

connect('mongodb://cs_02_taskmanagementsystem-mongo-1:27017/User');


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

// sign up API endpoint - creates a new user in the database using data from the request body
app.post('/signup', async (req, res) => {
    // hash the password before saving it to the database
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = await UserModel.create({ ...req.body, password: hashedPassword });
        res.json(newUser);
    }
    catch (error) {
        res.status(400).json('Error: ' + error);
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});