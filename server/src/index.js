const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { default: UserModel } = require('./models/User');


const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/User')


app.post('/signup', (req, res) => {
    UserModel.create(req.body)
    .then(user => res.json(user))
    .catch(err => res.status(400).json('Error: ' + err));
    console.log(req.body);
    res.send('Signup route');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});