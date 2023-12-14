const express = require('express');
const book_controller = require("../controllers/book.controller");

const router = express.Router();

router.get("/allbook", book_controller.getAllBook);
// router.post("/category", book_controller.getBookByCategory);
// router.post("/author", book_controller.getBookByAuthor);
router.get("/:id", book_controller.getBookByID);
router.get("/related/:bookId", book_controller.getRelatedBook);

module.exports = router;