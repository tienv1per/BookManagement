const express = require('express');
const publisher_controller = require("../controllers/publisher.controller");

const router = express.Router();

router.get("/all/:page", publisher_controller.getAll);

router.get("/", publisher_controller.getPublisher);

router.get("/name/:id", publisher_controller.getNameByID);

module.exports = router;