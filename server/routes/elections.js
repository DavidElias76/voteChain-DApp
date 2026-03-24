// elections.js
const express = require("express");
const router = express.Router();
const c = require("../controllers/electionController");
const { authenticate, requireAdmin } = require("../middleware/auth");

router.get("/", authenticate, c.getElections);
router.get("/:id", authenticate, c.getElection);
router.post("/", authenticate, requireAdmin, c.createElection);
router.post("/start/:id", authenticate, requireAdmin, c.startElection);
router.post("/end/:id", authenticate, requireAdmin, c.endElection);

module.exports = router;
