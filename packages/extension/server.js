const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./db");
const dns = require('dns');
const WebSocket = require('ws');

const app = express();
app.use(cors());

app.use(bodyParser.json({ limit: '5mb' })); // Increase limit for full reports

// Save or update scan result
app.post("/save-scan", async (req, res) => {
  let { url, status, safe_percentage, unsafe_percentage } = req.body;
  if (!url || !status) return res.status(400).json({ error: "Missing required fields" });

  status = status === "Safe" ? "Safe" : "Unsafe";
  safe_percentage = parseFloat(safe_percentage) || 0;
  unsafe_percentage = parseFloat(unsafe_percentage) || 0;

  // Look up IP address
  let ip_address = 'N/A';
  try {
    const addresses = await dns.promises.lookup(url);
    ip_address = addresses.address;
  } catch (err) {
    console.warn(`Could not resolve IP for ${url}:`, err.code);
  }

  let location = 'N/A';
  let asn = 'N/A';
  let country_code = 'N/A';

  if (ip_address && ip_address !== 'N/A') {
    try {
      const fetch = (await import('node-fetch')).default;
      const ip_api_res = await fetch(`http://ip-api.com/json/${ip_address}`);
      const ip_data = await ip_api_res.json();
      if (ip_data.status === 'success') {
        location = `${ip_data.city}, ${ip_data.country}`;
        asn = ip_data.as;
        country_code = ip_data.countryCode;
      }
    } catch (e) {
      console.warn('Failed to fetch IP info:', e);
    }
  }

  const query = `
    INSERT INTO SafeBrowsing (url, status, safe_percentage, unsafe_percentage, ip_address, location, asn, country_code, last_checked)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(url) DO UPDATE SET 
      status = excluded.status,
      safe_percentage = excluded.safe_percentage,
      unsafe_percentage = excluded.unsafe_percentage,
      ip_address = excluded.ip_address,
      location = excluded.location,
      asn = excluded.asn,
      country_code = excluded.country_code,
      last_checked = CURRENT_TIMESTAMP
  `;

  db.run(query, [url, status, safe_percentage, unsafe_percentage, ip_address, location, asn, country_code], function (err) {
    if (err) return res.status(500).json({ error: "Database insert failed" });
    console.log(`💾 Saved/Updated cache for: ${url} -> ${status} [${ip_address}]`);
    res.json({ success: true });
  });
});

// Get scan result by URL
app.get("/get-scan", (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "Missing url" });

  db.get("SELECT * FROM SafeBrowsing WHERE url = ?", [url], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.json({ found: false });

    res.json({
      found: true,
      status: row.status,
      safe_percentage: row.safe_percentage,
      unsafe_percentage: row.unsafe_percentage,
      ip_address: row.ip_address,
      location: row.location,
      asn: row.asn,
      country_code: row.country_code,
      last_checked: row.last_checked,
    });
  });
});

// Get history for the last 30 days
app.get("/get-history", (req, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  db.all("SELECT * FROM SafeBrowsing WHERE last_checked >= ? ORDER BY last_checked DESC", [thirtyDaysAgo.toISOString()], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

const PORT = 3001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// WebSocket server for realtime threat feeds
const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

// Function to broadcast threat updates to all connected clients
function broadcastThreatUpdate(threat) {
  const message = JSON.stringify(threat);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Mock function to simulate new threat detection
function simulateNewThreat() {
  const mockThreats = [
    {
      source: 'Real-time Alert',
      title: 'New phishing domain detected',
      url: 'https://suspicious-bank-login.com',
      severity: 'high',
      publishedAt: new Date().toISOString()
    },
    {
      source: 'Malware Scanner',
      title: 'Malicious file distribution network',
      url: 'https://malware-distribution.net',
      severity: 'critical',
      publishedAt: new Date().toISOString()
    },
    {
      source: 'Zero-day Watch',
      title: 'Critical vulnerability in web framework',
      url: 'https://vulnerable-framework.com',
      severity: 'critical',
      publishedAt: new Date().toISOString()
    }
  ];

  const randomThreat = mockThreats[Math.floor(Math.random() * mockThreats.length)];
  broadcastThreatUpdate(randomThreat);
}

// Simulate new threats every 30 seconds for demo purposes
setInterval(simulateNewThreat, 30000);
