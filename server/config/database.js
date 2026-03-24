const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "voting_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDB() {
  try {
    
    await pool.query(`USE voting_system`)

    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      wallet_address VARCHAR(42) UNIQUE,
      role ENUM('user', 'admin') DEFAULT 'user',
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_wallet (wallet_address)
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS elections (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status ENUM('pending', 'active', 'ended') DEFAULT 'pending',
      blockchain_election_id INT,
      start_date TIMESTAMP NULL,
      end_date TIMESTAMP NULL,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_status (status)
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS candidates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      election_id INT NOT NULL,
      blockchain_candidate_id INT,
      image_url VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
      INDEX idx_election (election_id)
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS votes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      election_id INT NOT NULL,
      candidate_id INT NOT NULL,
      transaction_hash VARCHAR(66) NOT NULL UNIQUE,
      block_number BIGINT,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
      FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
      UNIQUE KEY unique_vote (user_id, election_id),
      INDEX idx_transaction (transaction_hash),
      INDEX idx_election_votes (election_id)
    )`);

    await pool.query(`
      INSERT INTO users (name, email, password, role)
      SELECT 'Admin User', 'admin2@example.com', '$2a$10$xThdOQ7gjnoXW2tRHx5oXeMpSnz6Aa99fe6KeCfwhMiwTJP7ztO7y', 'admin'
      WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE email = 'admin2@example.com'
      )
    `);

    console.log("✅ Database tables ready");
  } catch (error) {
    console.error("❌ Database init error:", error.message);
  }
}

// Test connection then init tables
pool.getConnection()
  .then(conn => {
    console.log("✅ MySQL connected successfully");
    conn.release();
    initDB();
  })
  .catch(err => {
    console.error("❌ MySQL connection error:", err.message);
  });

module.exports = pool;