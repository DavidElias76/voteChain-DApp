const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const db = require("../config/database");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "secret_key_change_in_production";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, wallet_address } = req.body;

    // Check existing user
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(409).json({ error: "Email already registered." });

    if (wallet_address) {
      const [walletCheck] = await db.query("SELECT id FROM users WHERE wallet_address = ?", [wallet_address]);
      if (walletCheck.length > 0) return res.status(409).json({ error: "Wallet address already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, wallet_address, role) VALUES (?, ?, ?, ?, 'user')",
      [name, email, hashedPassword, wallet_address || null]
    );

    const token = jwt.sign(
      { 
        id: result.insertId, 
        email, 
        role: "user" 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: { id: result.insertId, name, email, role: "user", wallet_address }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error during registration." });
  }
};


// VALIDATE THE USER MAKE SURE THAT IT MATHCES THE DATABASE
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) return res.status(401).json({ error: "Invalid email or password." });

    const user = users[0];

    // const valid = password.trim() === user.password; // only allows the admin comparion without the bycrypt password

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(401).json({ error: "Invalid email or password." });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, wallet_address: user.wallet_address }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login." });
  }
};

exports.updateWallet = async (req, res) => {
  try {
    const { wallet_address } = req.body;
    if (!wallet_address) return res.status(400).json({ error: "Wallet address required." });

    const [check] = await db.query(
      "SELECT id FROM users WHERE wallet_address = ? AND id != ?",
      [wallet_address, req.user.id]
    );
    if (check.length > 0) return res.status(409).json({ error: "Wallet address already in use." });

    await db.query("UPDATE users SET wallet_address = ? WHERE id = ?", [wallet_address, req.user.id]);
    res.json({ message: "Wallet address updated successfully." });
  } catch (err) {
    console.error("Wallet update error:", err);
    res.status(500).json({ error: "Server error." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, wallet_address, role, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ error: "User not found." });
    res.json({ user: users[0] });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
};


exports.addAdmin = async (req, res) => {
  try {
    console.log("Add admin body:", req.body);
    
    const name = req.body?.name;
    const email = req.body?.email;
    const password = req.body?.password;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "Admin created successfully." });
  } catch (err) {
    console.error("Add admin error:", err);
    res.status(500).json({ error: "Server error." });
  }
};