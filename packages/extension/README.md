# Phishing Detector Browser Extension

This is a browser extension for Chrome, Firefox, and Edge that uses a local machine learning model to classify websites as "Safe" or "Unsafe" to help protect against phishing.

## How it works
- **Content Script**: Runs on all websites to provide on-hover link scanning and full-page warnings for unsafe sites.
- **Background Script**: Orchestrates URL classification using a local model.
- **Local Caching**: A Node.js server with an SQLite database caches scan results to improve performance.
- **Popup UI**: Shows the safety status of the current page.

## Installation
1. Clone the repository.
2. Run `npm install` to install the backend dependencies.
3. Run `node server.js` to start the local caching server.
4. Open your browser's extension page (e.g., `chrome://extensions`).
5. Enable "Developer mode".
6. Click "Load unpacked" and select the project directory.

## Note
URL classification is performed locally. Scan results are sent to a local server running on `http://localhost:3000` for caching purposes only. No data is sent to any external servers.
