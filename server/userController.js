// server/index.js (or your API route file)
import express from 'express';
import User from './models/User.js'; // Assuming you have a User model

const router = express.Router();

router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            fullName: `${user.firstName} ${user.lastName}`, // Construct full name
            // Add other user data as needed
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;