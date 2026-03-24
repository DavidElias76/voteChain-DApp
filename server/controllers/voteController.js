const db = require("../config/database");
const { getContract, getProvider } = require("../config/blockchain");
const { ethers } = require("ethers");

// casting a vote
exports.castVote = async (req, res) => {
  try {
    const { election_id, candidate_id, transaction_hash } = req.body;
    if (!election_id || !candidate_id || !transaction_hash) {
      return res.status(400).json({ error: "election_id, candidate_id, and transaction_hash required." });
    }

    // Check if already voted in DB
    const [existingVotes] = await db.query(
      "SELECT id FROM votes WHERE user_id = ? AND election_id = ?",
      [req.user.id, election_id]
    );
    if (existingVotes.length > 0) {
      return res.status(409).json({ error: "You have already voted in this election." });
    }

    // Verify transaction on blockchain
    const provider = getProvider();
    const receipt = await provider.getTransactionReceipt(transaction_hash);
    if (!receipt || !receipt.status) {
      return res.status(400).json({ error: "Transaction not confirmed or failed." });
    }

    // Store vote metadata in DB
    await db.query(
      "INSERT INTO votes (user_id, election_id, candidate_id, transaction_hash, block_number) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, election_id, candidate_id, transaction_hash, receipt.blockNumber]
    );

    res.status(201).json({
      message: "Vote recorded successfully.",
      transaction_hash,
      block_number: receipt.blockNumber
    });
  } catch (err) {
    console.error("Vote error:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Already voted in this election." });
    }
    res.status(500).json({ error: err.message || "Failed to record vote." });
  }
};


exports.checkVoteStatus = async (req, res) => {
  try {
    const { electionId } = req.params;
    const [votes] = await db.query(
      "SELECT v.*, c.name as candidate_name FROM votes v JOIN candidates c ON v.candidate_id = c.id WHERE v.user_id = ? AND v.election_id = ?",
      [req.user.id, electionId]
    );
    res.json({ has_voted: votes.length > 0, vote: votes[0] || null });
  } catch (err) {
    res.status(500).json({ error: "Failed to check vote status." });
  }
};
