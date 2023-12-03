const express = require('express');
const router = express.Router();
const bill_controller = require('../controllers/bill.controller');

router.post("/add", bill_controller.addBill);
router.get("/verify/:token", bill_controller.verifyPayment);
router.get("/:id_user", bill_controller.getBillByIDUser);
router.get("/delete/:id", bill_controller.deleteBill);
router.get("/top10", bill_controller.statisticalTop10);
router.post("/statistical/revenue/day", bill_controller.statisticaRevenueDay);
router.post("/statistical/revenue/month", bill_controller.statisticaRevenueMonth);
router.post("/statistical/revenue/year", bill_controller.statisticaRevenueYear);
// router.post("/statistical/revenue/quauter", bill_controller.statisticaRevenueQuauter);
router.get("/status/99", bill_controller.getBillNoVerify);
router.get("/status/1", bill_controller.getBillVerify);
router.get("/status/0", bill_controller.getProcessing);
router.post("/updateissend", bill_controller.updateIssend);


module.exports = router;