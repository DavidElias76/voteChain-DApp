const db = require("../config/database");
const { getProvider, contractConfig } = require("../config/blockchain");

exports.getTransactions = async (req, res) => {
  try {
    const [votes] = await db.query(
      `SELECT v.transaction_hash, v.block_number, v.timestamp,
        u.name as voter_name, u.wallet_address,
        e.title as election_title,
        c.name as candidate_name
       FROM votes v
       JOIN users u ON v.user_id = u.id
       JOIN elections e ON v.election_id = e.id
       JOIN candidates c ON v.candidate_id = c.id
       ORDER BY v.timestamp DESC
       LIMIT 50`
    );
    res.json({ transactions: votes });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions." });
  }
};

exports.verifyTransaction = async (req, res) => {
  try {
    const { hash } = req.params;
    const provider = getProvider();
    const [tx, receipt] = await Promise.all([
      provider.getTransaction(hash),
      provider.getTransactionReceipt(hash)
    ]);

    if (!tx) return res.status(404).json({ error: "Transaction not found." });

    res.json({
      hash,
      block_number: receipt?.blockNumber,
      status: receipt?.status === 1 ? "success" : "failed",
      from: tx.from,
      to: tx.to,
      gas_used: receipt?.gasUsed?.toString(),
      confirmed: !!receipt
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to verify transaction." });
  }
};

exports.getContractInfo = async (req, res) => {
  res.json({
    address: contractConfig.address,
    network: contractConfig.network,
    deployed_at: contractConfig.deployedAt
  });
};
