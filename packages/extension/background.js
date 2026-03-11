// background.js — DataShield.AI intelligent backend handler

const BACKEND_URL = "http://localhost:8000/predict";
const REPORT_URL = "http://localhost:3000/api/report-phishing";

// On extension install, redirect to web login page
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('🛠️ Extension installed - redirecting to login');

    // Check if login page is already open to avoid multiple tabs
    chrome.tabs.query({ url: 'http://localhost:3000/login' }, (tabs) => {
      if (tabs.length === 0) {
        // No login tab open, create one
        chrome.tabs.create({ url: 'http://localhost:3000/login' });
      } else {
        // Login tab already exists, just activate it
        chrome.tabs.update(tabs[0].id, { active: true });
        chrome.windows.update(tabs[0].windowId, { focused: true });
      }
    });
  }
});

// ------------------------------
// Helper: get domain from URL
// ------------------------------
function resolveDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ------------------------------
// API functions using web endpoints
// ------------------------------
async function getFromDB(url) {
  try {
    const resp = await fetch(`http://localhost:3000/api/get-scan?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.found ? data : null;
  } catch (err) {
    console.error("❌ DB lookup failed:", err);
    return null;
  }
}

async function fetchIpApiData(query) {
  try {
    const response = await fetch(`http://ip-api.com/json/${query}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
    if (!response.ok) {
      console.error("❌ IP-API lookup failed:", response.status, response.statusText);
      return null;
    }
    const data = await response.json();
    if (data.status === 'success') {
      return {
        ip_address: data.query,
        asn: data.as,
        location: `${data.city}, ${data.regionName}, ${data.country} ${data.countryCode ? `(${data.countryCode})` : ''}`,
        country_code: data.countryCode,
      };
    } else {
      console.error("❌ IP-API status not success:", data.message);
      return null;
    }
  } catch (err) {
    console.error("❌ Error fetching IP-API data:", err);
    return null;
  }
}

async function saveToDB(url, result) {
  try {
    await fetch("http://localhost:3000/api/save-scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, ...result }),
    });
  } catch (err) {
    console.error("❌ Failed to save in DB:", err);
  }
}

async function predictUrl(url) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) {
      throw new Error("Prediction failed");
    }
    return await response.json();
  } catch (err) {
    console.error("❌ Prediction failed:", err);
    return null;
  }
}

// ------------------------------
// Main checkWebsite
// ------------------------------
async function checkWebsite(url) {
  const domain = resolveDomain(url);

  let cached = await getFromDB(domain);
  if (cached) {
    console.log(`⚡ Cache hit for: ${domain}`);
    return { domain, ...cached };
  }

  console.log(`[ML] Cache miss. Running model for: ${domain}`);
  const mlResult = await predictUrl(url);
  if (!mlResult) {
    return { status: "Error", error: "Failed to get prediction" };
  }

  const ipApiData = await fetchIpApiData(domain);

  const finalResult = {
    ...mlResult,
    ...ipApiData,
    status: mlResult.prediction,
    safe_percentage: mlResult.safe_percentage ?? (mlResult.prediction === 'Safe' ? 100 - mlResult.confidence * 100 : 0),
    unsafe_percentage: mlResult.unsafe_percentage ?? (mlResult.prediction === 'Unsafe' ? mlResult.confidence * 100 : 0),
    prediction: mlResult.prediction, // Keep the original prediction field
    confidence: mlResult.confidence, // Keep the original confidence field
  };

  await saveToDB(domain, finalResult);
  return { domain, ...finalResult };
}

// Handle extension installation and setup
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log("DataShield.AI installed — redirecting to login");
    // On install, redirect to web login page (duplicate removed)
  }
});



// Listen for tab updates (page loads)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url && isHttpUrl(tab.url)) {
    const termsAccepted = await getTermsAccepted();
    if (termsAccepted) {
      console.log(`🔍 Scanning URL: ${tab.url}`);
      scanAndNotify(tabId, tab.url);
    } else {
      console.log(`⏸️ Skipping scan for ${tab.url} - terms not accepted yet`);
    }
  }
});

// Listen for web navigation committed (new URL navigation)
chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId === 0 && details.url && isHttpUrl(details.url)) { // Only main frame
    const termsAccepted = await getTermsAccepted();
    if (termsAccepted) {
      console.log(`🌐 Navigation to URL: ${details.url}`);
      scanAndNotify(details.tabId, details.url);
    } else {
      console.log(`⏸️ Skipping navigation scan for ${details.url} - terms not accepted yet`);
    }
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkWebsite") {
    if (message.fullUrl) {
      // Always return true for async response and handle it properly
      checkWebsite(message.fullUrl).then((res) => {
        sendResponse(res);
      }).catch((error) => {
        console.error("❌ Error in checkWebsite:", error);
        sendResponse({ status: "Error", error: error.message });
      });
      return true;
    }
  } else {
    switch (message.type) {
      case "TERMS_ACCEPTED":
        chrome.storage.local.set({ termsAccepted: true }, () => {
          console.log("✅ Terms accepted - extension fully activated");
          sendResponse({ success: true });
        });
        return true;

      case "OPEN_TERMS_PAGE":
        // Open terms page when requested
        chrome.tabs.create({ url: chrome.runtime.getURL('terms.html') });
        break;

      case "HOVER_URL_CHECK":
        console.log(`🖱️ Hover check for: ${message.url}`);
        checkUrlOnHover(message.url, sender.tab?.id);
        break;

      case "GET_URL_STATUS":
        console.log(`📊 Getting URL status for: ${message.url}`);
        getUrlStatus(message.url, sender.tab?.id, sendResponse);
        return true; // Keep the message channel open for async response
        break;

      case "REPORT_PHISHING":
        handleReportPhishing(message, sendResponse);
        return true;

      case "CLOSE_TAB":
        if (sender.tab?.id) {
          chrome.tabs.remove(sender.tab.id);
        }
        break;

      // Voice Command Handlers
      case "VOICE_SCAN_WEBSITE":
        console.log("🎤 Voice command: Scan website");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.url) {
            checkWebsite(tabs[0].url, (result) => {
              chrome.tabs.sendMessage(tabs[0].id, {
                type: "SHOW_PAGE_RESULT",
                result,
              });
            });
          }
        });
        break;

      case "VOICE_START_SCAN":
        console.log("🎤 Voice command: Start scan");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.url) {
            scanAndNotify(tabs[0].id, tabs[0].url);
          }
        });
        break;

      case "VOICE_STOP_SCAN":
        console.log("🎤 Voice command: Stop scan");
        // Implement scan stopping logic if needed
        break;

      case "VOICE_REPORT_INCIDENT":
        console.log("🎤 Voice command: Report incident");
        chrome.tabs.create({ url: 'http://localhost:3000/incident-response' });
        break;

      case "VOICE_BLOCK_WEBSITE":
        console.log("🎤 Voice command: Block website");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.url) {
            // Add to parental control block list
            chrome.storage.local.get(['blockedSites'], (data) => {
              const blockedSites = data.blockedSites || [];
              const domain = resolveDomain(tabs[0].url);
              if (!blockedSites.includes(domain)) {
                blockedSites.push(domain);
                chrome.storage.local.set({ blockedSites });
              }
            });
          }
        });
        break;

      case "VOICE_UNBLOCK_WEBSITE":
        console.log("🎤 Voice command: Unblock website");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.url) {
            chrome.storage.local.get(['blockedSites'], (data) => {
              const blockedSites = data.blockedSites || [];
              const domain = resolveDomain(tabs[0].url);
              const updatedSites = blockedSites.filter(site => site !== domain);
              chrome.storage.local.set({ blockedSites: updatedSites });
            });
          }
        });
        break;

      case "VOICE_CONNECT_DEVICE":
        console.log("🎤 Voice command: Connect device");
        // Implement device connection logic
        break;

      case "VOICE_DISCONNECT_DEVICE":
        console.log("🎤 Voice command: Disconnect device");
        // Implement device disconnection logic
        break;

      case "VOICE_RUN_CHECKUP":
        console.log("🎤 Voice command: Run checkup");
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.url) {
            scanAndNotify(tabs[0].id, tabs[0].url);
          }
        });
        break;

      case "VOICE_CLEAR_HISTORY":
        console.log("🎤 Voice command: Clear history");
        // Clear scan history from storage
        chrome.storage.local.remove(['scanHistory']);
        break;

      case "VOICE_CHECK_SYSTEM":
        console.log("🎤 Voice command: Check system");
        // Implement system health check
        break;
    }
  }
});

// -------------------------------
// 🔍 Helper Functions
// -------------------------------

// Checks if URL is valid (HTTP/HTTPS only)
function isHttpUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}

// Get terms acceptance status
function getTermsAccepted() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["termsAccepted"], (data) => {
      resolve(data.termsAccepted === true);
    });
  });
}

// Perform backend scan for a tab
async function scanAndNotify(tabId, url) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) throw new Error("Failed to fetch backend result");

    const result = await response.json();
    console.log("✅ Scan result:", result);

    chrome.tabs.sendMessage(tabId, {
      type: "SHOW_PAGE_RESULT",
      result,
    });
  } catch (error) {
    console.error("❌ Error during scan:", error);
    chrome.tabs.sendMessage(tabId, {
      type: "SHOW_PAGE_RESULT",
      result: { prediction: "Error", error: error.message, url },
    });
  }
}

// Hover-based quick check (no overlay)
let lastHoverUrl = null;
let hoverTimeout = null;

async function checkUrlOnHover(url, tabId) {
  if (url === lastHoverUrl) return;
  lastHoverUrl = url;

  clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(async () => {
    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error("Hover check failed");

      const result = await response.json();
      console.log(`🧠 Hover Scan Result for ${url}:`, result.prediction);

      // Send result back to content script for tooltip display
      chrome.tabs.sendMessage(tabId, {
        type: "SHOW_HOVER_RESULT",
        url,
        result,
      });
    } catch (error) {
      console.warn("⚠️ Hover check error:", error.message);
      chrome.tabs.sendMessage(tabId, {
        type: "SHOW_HOVER_RESULT",
        url,
        result: { prediction: "Error", error: error.message },
      });
    }
  }, 1200);
}

// Handle phishing report submission
async function handleReportPhishing(data, sendResponse) {
  try {
    const response = await fetch(REPORT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: data.url,
        prediction: data.prediction,
        confidence: data.confidence,
        ip_address: data.ip_address,
        asn: data.asn,
        location: data.location,
        country_code: data.country_code,
      }),
    });

    if (!response.ok) throw new Error("Failed to submit report");

    console.log("📩 Report submitted successfully");
    sendResponse({ success: true });
  } catch (error) {
    console.error("❌ Report submission failed:", error.message);
    sendResponse({ success: false });
  }
}

// Get URL status for popup display
async function getUrlStatus(url, tabId, sendResponse) {
  try {
    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) throw new Error("Failed to fetch backend result");

    const result = await response.json();
    console.log("✅ URL status result:", result);

    // Add user location data from IP-API
    try {
      const ipResponse = await fetch(`https://ip-api.com/json/`);
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        result.user_country = ipData.country;
        result.user_city = ipData.city;
        result.user_isp = ipData.isp;
        result.user_timezone = ipData.timezone;
      }
    } catch (ipError) {
      console.warn("⚠️ Could not fetch user location:", ipError.message);
    }

    sendResponse(result);
  } catch (error) {
    console.error("❌ Error getting URL status:", error);
    sendResponse({
      status: "Error",
      error: error.message,
      url
    });
  }
}
