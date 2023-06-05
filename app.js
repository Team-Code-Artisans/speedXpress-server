const express = require("express");
const app = express();
const cors = require("cors");
const userRoute = require("./routes/user.route");
const parcelRoute = require("./routes/parcel.route");

// middleware
app.use(express.json());
app.use(cors());

app.use("/api/v1/users", userRoute);
app.use("/api/v1/parcel", parcelRoute);

app.get("/", (req, res) => {
  res.send("speed-xpress server in running");
});

app.all("*", (req, res) => {
  res.send("No routes found");
});

module.exports = app;
