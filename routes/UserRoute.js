const express = require('express');
const UserController = require("../controllers/UserController");

const router = express.Router();

// UPDATE User
router.put("/:id", UserController.updateUser);
// GET User by id
router.get("/:id", UserController.getUser);
// GET ALL Users
router.get("/", UserController.getAllUsers);
// DELETE User 
router.delete("/:id", UserController.deleteUser);

module.exports = router;