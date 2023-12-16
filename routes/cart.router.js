const express = require('express');
const cart_controller = require("../controllers/cart.controller");

const router = express.Router();


router.post("/addtocart", cart_controller.addToCart);

router.get("/:id_user", cart_controller.getAll);

router.post("/update", cart_controller.update);

router.post("/delete", cart_controller.delete);

module.exports = router;




