const express = require("express");
const session = require("express-session");
var cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require('dotenv').config();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const path = require("path");
const connection = require('./utils/database');



//****** Begin App setup ******
const app = express();
//configure the Express middleware to accept CORS requests and parse request body into JSON
app.use(cors({origin: "*" }));
//app.use(allowCrossDomain);
app.use(cookieParser()); // cookies parser
//app.use(helmet());  // helmet protects against some http vulnerabilities!       //For live with security
app.use( helmet({ crossOriginResourcePolicy: false, }) );                       //for local security compromise

app.disable('x-powered-by') // to protect against fingerprint attacks!
// All static contents of the Angular frontend are served from this directory
const publicDir = path.join(__dirname, '/views/public');
app.use(express.static(publicDir));
app.set('trust proxy', 1)  // necessary if app runs behing nginx proxy for https secutiry etc.
const expMinutes = 10; // (in minutes)
const expireTime = expMinutes * 60 * 1000;
app.use(session({
	secret: 'kuchbhisecrethay',
	resave: false,
	saveUninitialized: true,
  expires: new Date(Date.now() + expireTime ),  // expires after x minute!
  cookie: { maxAge: expireTime },
}));
// not accepting nested json post data
app.use(express.urlencoded({extended: 'true'}));
app.use(bodyParser.json());
// to respond with a template if login not successfull
app.set('view engine', 'hbs');
//***** End App setup *****

const apiRoutes = require('./routes/ApiRoutes');
const nonApiRoutes = require('./routes/nonApiRoutes');

app.use(express.json());
// app.use('/', nonApiRoutes); // non api routes
app.use('/api', apiRoutes);

app.listen(process.env.PORT, ()=> {
    console.log("Server started on port " + process.env.PORT);
});
