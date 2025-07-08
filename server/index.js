const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoute = require("./Routes/AuthRoute");
const app = express();
require("dotenv").config({ debug: true })
const {MONGO_URL } = process.env;
const PORT = 3000;
mongoose
    .connect(MONGO_URL,{})
  .then(() => console.log("MongoDB is  connected successfully"))
  .catch((err) => console.error(err));
app.use(
    cors({
    origin: ["http://localhost:3000","http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    })
)
app.use(express.json());
app.use("/", authRoute);

app.listen(PORT,()=>{
    console.log( `Server is listening on ${PORT}`);
});