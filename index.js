const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require("cookie-parser");
const AuthRouter = require("./routes/AuthRoute");
const UserRouter = require("./routes/UserRoute");
const authorRouter = require("./routes/author.router");
const bookRouter = require("./routes/book.router");
const publisherRouter = require("./routes/publisher.router");
const adminRouter = require('./routes/admin.router');
const categoryRouter = require('./routes/category.router');

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
app.use(cookieParser());

app.use("/auth", AuthRouter);
app.use("/users", UserRouter);
app.use("/author", authorRouter);

app.use("/book", bookRouter);
app.use("/publisher", publisherRouter);
app.use("/admin", adminRouter);
app.use("/category", categoryRouter);

app.listen(PORT, (req, res) => {
    connect();
    console.log(`Listening on ${PORT}`);
});