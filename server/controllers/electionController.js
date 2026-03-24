const db = require("../config/database");
const { getContract, getAdminSigner } = require("../config/blockchain");

exports.getElections = async (req, res) => {
  try {
    const [elections] = await db.query(
      `SELECT e.*, u.name as created_by_name,
        (SELECT COUNT(*) FROM candidates c WHERE c.election_id = e.id) as candidate_count,
        (SELECT COUNT(*) FROM votes v WHERE v.election_id = e.id) as vote_count
       FROM elections e
       LEFT JOIN users u ON e.created_by = u.id
       ORDER BY e.created_at DESC`
    );
    res.json({ elections });
  } catch (err) {
    console.error("Get elections error:", err);
    res.status(500).json({ error: "Failed to fetch elections." });
  }
};

// requesting a specific elections
exports.getElection = async (req, res) => {
  try {
    const { id } = req.params;
    const [elections] = await db.query(
      `SELECT e.*, u.name as created_by_name FROM elections e
       LEFT JOIN users u ON e.created_by = u.id WHERE e.id = ?`,
      [id]
    );
    if (elections.length === 0) return res.status(404).json({ error: "Election not found." });
    res.json({ election: elections[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch election." });
  }
};

// creating an election
exports.createElection = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required." });

    // Create on blockchain
    const signer = getAdminSigner();
    const contract = getContract(signer);
    const tx = await contract.createElection(title, description || "");
    const receipt = await tx.wait();

    // Get election ID from event
    let blockchainElectionId = null;
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed && parsed.name === "ElectionCreated") {
          blockchainElectionId = Number(parsed.args.electionId);
          break;
        }
      } catch {}
    }

    // Save to DB
    const [result] = await db.query(
      "INSERT INTO elections (title, description, status, blockchain_election_id, created_by) VALUES (?, ?, 'pending', ?, ?)",
      [title, description || null, blockchainElectionId, req.user.id]
    );

    res.status(201).json({
      message: "Election created successfully.",
      election: { id: result.insertId, title, description, status: "pending", blockchain_election_id: blockchainElectionId },
      transaction_hash: receipt.hash
    });
  } catch (err) {
    console.error("Create election error:", err);
    res.status(500).json({ error: err.message || "Failed to create election." });
  }
};

// stsrting an election
exports.startElection = async (req, res) => {
  try {
    const { id } = req.params;
    const [elections] = await db.query("SELECT * FROM elections WHERE id = ?", [id]);
    if (elections.length === 0) return res.status(404).json({ error: "Election not found." });

    const election = elections[0];
    if (election.status !== "pending") return res.status(400).json({ error: "Election cannot be started." });
    if (!election.blockchain_election_id) return res.status(400).json({ error: "Election not on blockchain." });

    const signer = getAdminSigner();
    const contract = getContract(signer);
    const tx = await contract.startElection(election.blockchain_election_id);
    const receipt = await tx.wait();

    await db.query(
      "UPDATE elections SET status = 'active', start_date = NOW() WHERE id = ?",
      [id]
    );

    res.json({ message: "Election started.", transaction_hash: receipt.hash });
  } catch (err) {
    console.error("Start election error:", err);
    res.status(500).json({ error: err.message || "Failed to start election." });
  }
};

// ending an election 
exports.endElection = async (req, res) => {
  try {
    const { id } = req.params;
    const [elections] = await db.query("SELECT * FROM elections WHERE id = ?", [id]);
    if (elections.length === 0) return res.status(404).json({ error: "Election not found." });

    const election = elections[0];
    if (election.status !== "active") return res.status(400).json({ error: "Election is not active." });

    // the blockchain problem
    const signer = getAdminSigner();
    const contract = getContract(signer);
    const tx = await contract.endElection(election.blockchain_election_id);
    const receipt = await tx.wait();

    await db.query(
      "UPDATE elections SET status = 'ended', end_date = NOW() WHERE id = ?",
      [id]
    );

    res.json({ message: "Election ended.", transaction_hash: receipt.hash });
  } catch (err) {
    console.error("End election error:", err);
    res.status(500).json({ error: err.message || "Failed to end election." });
  }
};
