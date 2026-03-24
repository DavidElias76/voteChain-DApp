const express = require("express");
const router = express.Router();
const c = require("../controllers/resultController");
const { authenticate } = require("../middleware/auth");

router.get("/:electionId", authenticate, c.getResults);
router.get("/:electionId/blockchain", authenticate, c.getBlockchainResults);

module.exports = router;
