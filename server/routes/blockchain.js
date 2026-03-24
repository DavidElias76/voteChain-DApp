const express = require("express");
const router = express.Router();
const c = require("../controllers/blockchainController");
const { authenticate } = require("../middleware/auth");

router.get("/transactions", authenticate, c.getTransactions);
router.get("/verify/:hash", authenticate, c.verifyTransaction);
router.get("/contract", c.getContractInfo);

module.exports = router;
