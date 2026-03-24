-- Decentralized Voting System Database Schema
-- Run: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS voting_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE voting_system;

-- Users table
CREATE TABLE IF NOT EXISTS users (
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
);

-- Elections table
CREATE TABLE IF NOT EXISTS elections (
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
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  election_id INT NOT NULL,
  blockchain_candidate_id INT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  INDEX idx_election (election_id)
);

-- Votes table (metadata only - actual votes on blockchain)
CREATE TABLE IF NOT EXISTS votes (
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
);

-- Insert default admin user (password: Admin@123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@votingsystem.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Insert sample election
INSERT INTO elections (title, description, status, created_by) VALUES
('2024 Student Council Election', 'Annual student council president election for the academic year 2024-2025', 'pending', 1)
ON DUPLICATE KEY UPDATE id=id;
