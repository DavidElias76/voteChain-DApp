const express = require("express");
const router = express.Router();
const c = require("../controllers/voteController");
const { authenticate } = require("../middleware/auth");

router.post("/", authenticate, c.castVote);
router.get("/status/:electionId", authenticate, c.checkVoteStatus);

module.exports = router;
