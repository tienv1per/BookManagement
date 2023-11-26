
const express = require('express');
const admin_controller = require('../controllers/admin.controller');
const router = express.Router();
const multer = require('multer')
const storage = multer.diskStorage({
    destination: './files',
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const upload = multer({ storage });




router.post("/addbook",upload.single('file'), admin_controller.addBook);
router.post("/updatebook", admin_controller.updateBook);
router.get("/deletebook/:id", admin_controller.deletebook);




module.exports = router;