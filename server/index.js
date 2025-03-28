/**
 * index.js is the entry point of the server. It is the file that is run when you start the server.
 * - It is responsible for creating the server, connecting to the database, and defining the routes.
 * - Handles API endpoints for user login and signup.
 */
import express, {json, response} from 'express'; // Express.js used for creating the server
import cors from 'cors'; // CORS is a Connect/Express middleware for handling cross-origin requests.
import { connect } from 'mongoose'; // Mongoose used for connecting to MongoDB
import UserModel from "./models/User.js";
import bcrypt from 'bcrypt';

// Create an Express server
const app = express();
const port = 5001;

// Middleware set up:

app.use(cors()); 
app.use(json()); // parse incoming JSON requests
app.use(express.json());
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
        
        console.log(req.body);
        // check if user already exists using unqiue email
        const existingUser = await UserModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json('User already exists');
        }

        // hash the password before saving it to the database
        //const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        // create a new user in the database
        const newUser = await UserModel(req.body);
        await newUser.save().then(() => {
            console.log('User saved to user database');
          })
          .catch((err) => {
            console.error('Error saving user:', err);
          });
        res.json(newUser);
    }
    catch (error) {
        res.status(400).json('Error: ' + error);
    }
});

// sign up API endpoint - creates a new user in the database using data from the request body
app.post('/calendar', async (req, res) => {
    try { 
        console.log(req.body);
    }
    catch (error) {
        res.status(400).json('Error: ' + error);
    }
});

app.get('/users', async (req, res) => {
    try {
        const user = await UserModel.find(); // Fetch all tasks
        console.log("Fetched users:", user); // Log tasks to the console
        res.json(user); // Send response
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ message: 'Error fetching user', error });
    }
});


// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});