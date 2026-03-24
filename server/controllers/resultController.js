const db = require("../config/database");
const { getContract } = require("../config/blockchain");

exports.getResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const [elections] = await db.query("SELECT * FROM elections WHERE id = ?", [electionId]);
    if (elections.length === 0) return res.status(404).json({ error: "Election not found." });

    const election = elections[0];

    // Get candidates with vote counts from DB
    const [candidates] = await db.query(
      `SELECT c.id, c.name, c.description, c.blockchain_candidate_id,
        COUNT(v.id) as vote_count
       FROM candidates c
       LEFT JOIN votes v ON v.candidate_id = c.id AND v.election_id = ?
       WHERE c.election_id = ?
       GROUP BY c.id
       ORDER BY vote_count DESC`,
      [electionId, electionId]
    );

    const totalVotes = candidates.reduce((sum, c) => sum + Number(c.vote_count), 0);
    const resultsWithPercentage = candidates.map(c => ({
      ...c,
      percentage: totalVotes > 0 ? ((Number(c.vote_count) / totalVotes) * 100).toFixed(1) : "0.0"
    }));

    res.json({
      election,
      candidates: resultsWithPercentage,
      total_votes: totalVotes
    });
  } catch (err) {
    console.error("Results error:", err);
    res.status(500).json({ error: "Failed to fetch results." });
  }
};

exports.getBlockchainResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const [elections] = await db.query("SELECT blockchain_election_id FROM elections WHERE id = ?", [electionId]);
    if (elections.length === 0) return res.status(404).json({ error: "Election not found." });

    const contract = getContract();
    const [ids, names, voteCounts] = await contract.getResults(elections[0].blockchain_election_id);

    const results = ids.map((id, i) => ({
      id: Number(id),
      name: names[i],
      vote_count: Number(voteCounts[i])
    }));

    res.json({ results, source: "blockchain" });
  } catch (err) {
    console.error("Blockchain results error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch blockchain results." });
  }
};
