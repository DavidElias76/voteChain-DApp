const express = require("express");
const router = express.Router();
const c = require("../controllers/candidateController");
const { authenticate, requireAdmin } = require("../middleware/auth");

router.get("/:electionId", authenticate, c.getCandidates);
router.post("/", authenticate, requireAdmin, c.addCandidate);

module.exports = router;
