const express = require('express');
const nsx_controller = require("../controllers/nsx.controller");

const router = express.Router();

router.get("/all", nsx_controller.getAll);

router.get("/", nsx_controller.getNsx);

router.get("/name/:id", nsx_controller.getNameByID);

module.exports = router;