const express = require("express");
const app = express();
const cors = require("cors");
const userRoute = require("./routes/user.route");
const parcelRoute = require("./routes/parcel.route");
const tokenRoute = require("./routes/token.route");

// middleware
app.use(express.json());
app.use(cors());

module.exports = app;
