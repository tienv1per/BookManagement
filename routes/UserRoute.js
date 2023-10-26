const express = require('express');
const UserController = require("../controllers/UserController");

const router = express.Router();

// UPDATE User
router.put("/:id", (UserController.updateUser));
// GET User by id
router.get("/:id", (UserController.getUser));

module.exports = router;