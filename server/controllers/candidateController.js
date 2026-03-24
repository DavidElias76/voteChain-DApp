const db = require("../config/database");
const { getContract, getAdminSigner } = require("../config/blockchain");

exports.getCandidates = async (req, res) => {
  try {
    const { electionId } = req.params;
    const [candidates] = await db.query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM votes v WHERE v.candidate_id = c.id) as vote_count
       FROM candidates c WHERE c.election_id = ? ORDER BY c.id ASC`,
      [electionId]
    );
    res.json({ candidates });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch candidates." });
  }
};

exports.addCandidate = async (req, res) => {
  try {
    const { election_id, name, description } = req.body;
    if (!election_id || !name) return res.status(400).json({ error: "Election ID and name required." });

    const [elections] = await db.query("SELECT * FROM elections WHERE id = ?", [election_id]);
    if (elections.length === 0) return res.status(404).json({ error: "Election not found." });

    const election = elections[0];
    if (election.status !== "pending") return res.status(400).json({ error: "Can only add candidates to pending elections." });

    // Add to blockchain
    const signer = getAdminSigner();
    const contract = getContract(signer);
    const tx = await contract.addCandidate(election.blockchain_election_id, name, description || "");
    const receipt = await tx.wait();

    let blockchainCandidateId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed && parsed.name === "CandidateAdded") {
          blockchainCandidateId = Number(parsed.args.candidateId);
          break;
        }
      } catch {}
    }

    const [result] = await db.query(
      "INSERT INTO candidates (name, description, election_id, blockchain_candidate_id) VALUES (?, ?, ?, ?)",
      [name, description || null, election_id, blockchainCandidateId]
    );

    res.status(201).json({
      message: "Candidate added.",
      candidate: { id: result.insertId, name, description, election_id, blockchain_candidate_id: blockchainCandidateId },
      transaction_hash: receipt.hash
    });
  } catch (err) {
    console.error("Add candidate error:", err);
    res.status(500).json({ error: err.message || "Failed to add candidate." });
  }
};
