const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./SafeBrowsing.db", (err) => {
  if (err) console.error("❌ Error connecting to SQLite:", err.message);
  else console.log("✅ Connected to SQLite database (SafeBrowsing.db)");
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS SafeBrowsing (
      url TEXT PRIMARY KEY,
      status TEXT CHECK(status IN ('Safe','Unsafe')) NOT NULL DEFAULT 'Safe',
      safe_percentage REAL NOT NULL DEFAULT 0,
      unsafe_percentage REAL NOT NULL DEFAULT 0,
      ip_address TEXT,
      location TEXT,
      asn TEXT,
      country_code TEXT,
      last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;