const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "voting_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function resetAndInit() {
  try {
    console.log("🔄 Resetting blockchain-related tables...");

    // Delete in correct order to avoid foreign key errors
    await pool.query(`DELETE FROM votes`);
    await pool.query(`DELETE FROM candidates`);
    await pool.query(`DELETE FROM elections`);

    console.log("✅ Tables cleared");

    // Re-insert default admin if not exists
    await pool.query(`
      INSERT INTO users (name, email, password, role)
      SELECT 'Admin User', 'admin2@example.com', '$2a$10$xThdOQ7gjnoXW2tRHx5oXeMpSnz6Aa99fe6KeCfwhMiwTJP7ztO7y', 'admin'
      WHERE NOT EXISTS (
        SELECT 1 FROM users WHERE email = 'admin2@example.com'
      )
    `);

    console.log("✅ Admin credentials ready");
    console.log("✅ Done — now start the server with: npm run dev");

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

pool.getConnection()
  .then(conn => {
    console.log("✅ MySQL connected successfully");
    conn.release();
    resetAndInit();
  })
  .catch(err => {
    console.error("❌ MySQL connection error:", err.message);
    process.exit(1);
  });