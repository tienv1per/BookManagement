const express = require('express');
const category_controller = require("../controllers/category.controller");

const router = express.Router();


router.get("/", (category_controller.getCategory));

router.get("/name/:id", (category_controller.getNameByID));

module.exports = router;