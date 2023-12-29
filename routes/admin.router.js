
const express = require('express');
const admin_controller = require('../controllers/admin.controller');
const router = express.Router();
const multer = require('multer')


router.post("/addbook", admin_controller.addBook);
router.post("/updatebook/:id", admin_controller.updateBook);
router.get("/deletebook/:id", admin_controller.deletebook);

module.exports = router;