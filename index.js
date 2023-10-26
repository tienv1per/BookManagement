const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const AuthRouter = require("./routes/AuthRoute");
const UserRouter = require("./routes/UserRoute");

dotenv.config();
const app = express();

const PORT = process.env.PORT || 8000;
const MONGO = process.env.MONGO;

const connect = async () => {
    try {
        await mongoose.connect(MONGO);
        console.log("Connected to mongoDB");
    }
    catch(err) {
        console.log(err.message);
        throw err;
    }
}

app.use(cors());
app.use(express.json());

app.use("/auth", AuthRouter);
app.use("/users", UserRouter);

app.listen(PORT, (req, res) => {
    connect();
    console.log(`Listening on ${PORT}`);
});