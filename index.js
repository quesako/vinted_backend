require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());
mongoose.connect(process.env.MONGODB_URI);

/*
 * * Routes
 */

const allOfferRoutes = require("./route/offer");
const allUserRoutes = require("./route/user");
const paymentRoute = require("./route/payment");


app.use(allOfferRoutes);
app.use(allUserRoutes);
app.use(paymentRoute);


/*
 * * Default routing
 */

app.all("*", (req, res) => {
  res.json({ message: "Route is  not found" });
});

/*
 * * Listen
 */

app.listen(process.env.PORT, () => {
  console.log("Server has start");
});
