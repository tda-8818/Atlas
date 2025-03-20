const express = require('express');
const mongoose = require('mongoose');
//const cors = require('cors');


const app = express();
const port = 5001;

//app.use(cors());
app.use(express.json());

//mongoose.connect('mongodb://localhost:27017/[nameofdatabase]')

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
}
);