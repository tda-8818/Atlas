/**
 * index.js is the entry point of the server. It is the file that is run when you start the server.
 * It is responsible for creating the server, connecting to the database, and defining the routes.
 * Handles API endpoints for user login and signup.
 */

// Importing required modules
const express = require('express'); // Express.js used for creating the server
const mongoose = require('mongoose'); // Mongoose used for connecting to MongoDB
const cors = require('cors'); // CORS is a Connect/Express middleware for handling cross-origin requests.
const { default: UserModel } = require('./models/User');

// Create an Express server
const app = express();
const port = 5001;

// Middleware set up:

app.use(cors());
app.use(express.json()); // parse incoming JSON requests

mongoose.connect('mongodb://cs_02_taskmanagementsystem-mongo-1:27017/User');


// login API endpoint - checks if email+password combination exists in the database
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    UserModel.findOne({ email: email, password: password })
    .then(res.json(user))
    .catch(err => res.status(400).json('Error: ' + err));
    console.log(req.body);
    res.send('Login route');
});

// sign up API endpoint - creates a new user in the database using data from the request body
app.post('/signup', (req, res) => {
    UserModel.create(req.body)
    .then(user => res.json(user))
    .catch(err => res.status(400).json('Error: ' + err));
    console.log(req.body);
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});