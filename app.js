const express = require('express');
const app = express();

const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const bodyParser = require('body-parser');


const connectDatabase = require('./config/database');
const errorMiddleware = require('./middlewares/errors');
const ErrorHandler = require('./utils/errorHandler');

// setting config .evn
dotenv.config({
    path: './config/.env'
})

// Handling Uncaught Exception
process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down due to uncaught exception.')
    process.exit(1);
});

// Connecting to databse
connectDatabase();

app.set('trust proxy', true);

// Set up body parser
app.use(bodyParser.urlencoded({ extended : true }));

app.use(express.json());

app.use(express.static('public'));

//set cooke parser
app.use(cookieParser());

//set cooke parser
app.use(fileUpload());

//set Express Mongo Sanitize
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xssClean());

// Prevent Parameter Pollution
app.use(
	hpp({
		whitelist: ['positions']
	})
);

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10*60*1000, //10 Mints
    max : 100
});



app.use(limiter);

// Setup security headers
app.use(helmet());

// Setup CORS - Accessible by other domains
app.use(cors());

// import all routes
const job = require('./routes/job');
const auth = require('./routes/auth');
const user = require('./routes/user');

app.use('/api/v1/', job);
app.use('/api/v1/', auth);
app.use('/api/v1/', user);

// Handle unhandled routes
app.all('*', (req, res, next) => {
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404));
});

// Middle ware handle error
app.use(errorMiddleware);

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode`);
})

// Handling Unhandled Promise Rejection
process.on('unhandledRejection', err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Unhandled promise rejection.')
    server.close( () => {
        process.exit(1);
    })
});
