const express = require('express');
const AuthController = require("../controllers/AuthController");

const router = express.Router();

router.get("/", (req, res, next) => {
    res.status(200).json("Hello bro");
    console.log("Hello bro");
})

router.post("/register", (AuthController.registerUser));

router.post("/login", AuthController.loginUser);

router.post("/logout", AuthController.logoutUser);

module.exports = router;