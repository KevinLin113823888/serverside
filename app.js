const express = require("express");
const cookieParser = require('cookie-parser');
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
    origin: ['http://localhost:3000','https://bejewelled-rugelach-940512.netlify.app', 'https://bejewelled-palmier-26e86d.netlify.app','https://leafy-gecko-996f91.netlify.app'],
    credentials: true,
    allowedHeaders: "Content-Type, Authorization, X-Requested-With",
}));
app.use(express.json({ limit: '100mb' }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
  
const connectDB = require("./mongo");
var userRouter = require('./routes/userRoute');
var mapRouter = require('./routes/mapRoute');
var communityRouter = require('./routes/communityRoute');
connectDB();
app.use('/user', userRouter);
app.use('/map', mapRouter);
app.use('/community', communityRouter);

module.exports = app;