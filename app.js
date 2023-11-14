const express = require('express');
const app = express();
const dotenv = require('dotenv');

// setting config .evn
dotenv.config({
    path: './config/.env'
})


// Connecting to databse
const connectDatabase = require('./config/database');
connectDatabase();

// set up body parser
app.use(express.json());

// import all routes
const job = require('./routes/job');
app.use('/api/v1/', job);


const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode`);
})