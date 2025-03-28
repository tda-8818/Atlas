import express from 'express';
import mongoose from 'mongoose';
import taskRoutes from './routes/task.routes.js'; // Import task routes
const port = 5002;


const app = express();
app.use(express.json()); // Middleware to parse JSON body

// Use task routes
app.use('/api/tasks', taskRoutes); // THIS LINE MAKES THE ROUTE WORK

mongoose.connect("mongodb+srv://ngsweejie:CS2TMS@cs02taskmanagementsyste.ko3ct.mongodb.net/tasks?retryWrites=true&w=majority&appName=CS02TaskManagementSystem")
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => console.log('Server running on port 5002'));
    })
    .catch(error => console.error('MongoDB connection error:', error));
