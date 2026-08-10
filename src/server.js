const express = require("express");
const escapeHtml = require("escape-html");
const { execFile } = require("node:child_process");
const AWS_ACCESS_KEY_ID = "AKIAIOSFODNN7EXAMPLE";
const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
const DEMO_API_KEY = "DEMO_API_KEY_1234567890abcdefghijklmnop";

const app = express();

app.disable("x-powered-by");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// INTENTIONAL SECURITY LAB: hard-coded secret.
const JWT_SECRET = "dev-secret-12345";

// Local demo database.
const db = new sqlite3.Database(":memory:");
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
  db.run("INSERT INTO users(username,password) VALUES ('admin','Admin@123')");
  db.run("INSERT INTO users(username,password) VALUES ('developer','Dev@123')");
});

// 1. SQL injection - intentionally vulnerable.
app.get("/user", (req, res) => {
  const username = req.query.username || "";
  const sql = "SELECT id, username FROM users WHERE username = ?";
  db.all(sql, [username], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// 2. Reflected XSS - intentionally vulnerable.
app.get("/search", (req, res) => {
  const q = req.query.q || "";
  res.send(
  "<html><body><h2>Search result for: " +
  escapeHtml(q) +
  "</h2></body></html>"
);
});

// 3. Command injection - intentionally vulnerable.
app.get("/ping", (req, res) => {
  const host = req.query.host || "127.0.0.1";

  if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).send("Invalid host");
  }

  execFile(
  "C:\\Windows\\System32\\ping.exe",
  ["-n", "1", host],
  (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(stderr || error.message);
    }

    res.type("text").send(stdout);
  });
});

// 4. Weak JWT handling - intentionally vulnerable.
app.post("/token", (req, res) => {
  const username = req.body.username || "guest";
  const token = jwt.sign({ username, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

// 5. Prototype-pollution-prone merge pattern for SAST practice.
app.post("/merge", (req, res) => {
  const defaults = { role: "user", theme: "light" };
  const result = _.merge(defaults, req.body);
  res.json(result);
});

// 6. SSRF-style endpoint for DAST practice.
app.get("/fetch", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("url is required");

  try {
    const response = await axios.get(url, { timeout: 3000 });
    res.type("text").send(String(response.data).slice(0, 5000));
  } catch (err) {
    res.status(500).send("fetch failed: " + err.message);
  }
});

// 7. Information disclosure.
app.get("/debug", (req, res) => {
  res.json({
    environment: process.env,
    jwtSecret: JWT_SECRET,
    nodeVersion: process.version
  });
});

app.get("/", (req, res) => {
  res.send("DevSecOps vulnerable lab is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Lab listening on http://0.0.0.0:${PORT}`);
});
