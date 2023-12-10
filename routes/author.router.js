const express = require('express');
const author_controller = require("../controllers/author.controller");

const router = express.Router();


router.get("/", (author_controller.getAuthor));

router.get("/name/:id", (author_controller.getNameByID));

module.exports = router;