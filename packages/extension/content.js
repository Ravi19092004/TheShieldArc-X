// content.js — DataShield.AI content handler

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
// Ask background for VT check
// ------------------------------
function checkWithBackground(fullUrl, callback) {
  chrome.runtime.sendMessage({ action: "checkWebsite", fullUrl }, (result) => {
    if (chrome.runtime.lastError) {
      console.error("❌ Message error:", chrome.runtime.lastError.message || chrome.runtime.lastError);
      callback({ status: "Error", error: "Could not communicate with the extension background." });
    } else {
      callback(result);
    }
  });
}

// ------------------------------
// Hover and Click popup for links
// ------------------------------
function addSafetyOnHover(linkElement) {
  if (linkElement.dataset.hasListener) return;
  linkElement.dataset.hasListener = "true";

  let popup;

  linkElement.addEventListener("mouseenter", () => {
    // If a popup is already being shown (e.g., from a rapid re-hover), do nothing.
    if (popup) return;

    // Show a "Scanning..." popup immediately to give feedback.
    showPopup({ status: "Scanning" });

    // Ask background script to check the website (it will handle caching and API calls)
    checkWithBackground(linkElement.href, (result) => {
      // The mouse might have left the element while we were waiting.
      // Only show the popup if there's still a "Scanning..." popup active.
      if (popup) {
        if (!result) {
          popup.remove();
          popup = null;
        } else {
          showPopup(result);
        }
      }
    });
  });

  // Add click-based scanning
  linkElement.addEventListener("click", (e) => {
    // Prevent default navigation to allow scanning
    e.preventDefault();

    // Show scanning popup on click
    showPopup({ status: "Scanning" });

    // Ask background script to check the website
    checkWithBackground(linkElement.href, (result) => {
      if (popup) {
        if (!result) {
          popup.remove();
          popup = null;
        } else {
          showPopup(result);
          // After showing result, allow navigation if safe, or warn if unsafe
          if (result.prediction === "Safe") {
            // Proceed with navigation
            window.location.href = linkElement.href;
          } else if (result.prediction === "Unsafe") {
            // Show warning, but allow user to proceed if they confirm
            if (confirm("This link appears unsafe. Proceed anyway?")) {
              window.location.href = linkElement.href;
            } else {
              popup.remove();
              popup = null;
            }
          } else {
            // Error, proceed anyway
            window.location.href = linkElement.href;
          }
        }
      }
    });
  });

  function showPopup(result) {
    if (!result) return;

    // If a popup already exists (e.g. "Scanning..."), remove it before creating the new one.
    if (popup) {
      popup.remove();
      popup = null;
    }

    // Map the web API response to the expected format
    const status = result.prediction || result.status;
    const isScanning = status === "Scanning";
    const isUnsafe = status === "Unsafe";
    const isError = status === "Error" || !status;

    // Theme colors inspired by popup.html
    const neonGreen = '#00ff66';
    const unsafeRed = '#ff6b6b';
    const errorOrange = '#ff9800';
    const muted = '#9aa09a';
    const scanningColor = '#cccccc';

    let borderColor = isScanning ? scanningColor : (isUnsafe ? unsafeRed : (isError ? errorOrange : neonGreen));
    let title = isScanning ? "🔍 Scanning..." : (isUnsafe ? "⚠ Unsafe Website" : (isError ? "🔍 Scan Error" : "✅ Safe Website"));
    let details = "Please wait...";

    if (isError) {
      details = result.error || "Could not retrieve info.";
    } else if (!isScanning) {
      // Calculate percentages from confidence if not provided directly
      const safePercentage = result.safe_percentage || (result.prediction === 'Safe' ? 100 - (result.confidence * 100) : 0);
      const unsafePercentage = result.unsafe_percentage || (result.prediction === 'Unsafe' ? result.confidence * 100 : 0);
      details = `Safe: ${safePercentage.toFixed(2)}% | Unsafe: ${unsafePercentage.toFixed(2)}%`;
    }

    popup = document.createElement("div");
    popup.innerHTML = `
      <div style="
        background: rgba(5, 6, 7, 0.85);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border-radius: 12px; padding: 10px 14px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', sans-serif;
        max-width: 240px;
        border: 1px solid rgba(0, 255, 102, 0.1);
        border-left: 6px solid ${borderColor};
      ">
        <div style="font-size: 14px; font-weight: bold; color: ${borderColor};">${title}</div>
        <div style="margin-top:6px; font-size: 13px; color: ${muted};">${details}</div>
      </div>
    `;
    popup.style.cssText = `position: absolute; z-index: 999999; pointer-events: none;`;
    document.body.appendChild(popup);
  }

  linkElement.addEventListener("mousemove", (e) => {
    if (popup) {
      popup.style.top = `${e.pageY + 12}px`;
      popup.style.left = `${e.pageX + 12}px`;
    }
  });

  linkElement.addEventListener("mouseleave", () => {
    if (popup) {
      popup.remove();
      popup = null;
    }
  });
}



// ------------------------------
// Collect relevant links
// ------------------------------
function getRelevantLinks() {
  if (location.hostname.includes("google.")) {
    return document.querySelectorAll(".tF2Cxc a, a[jsname='UWckNb']");
  } else if (location.hostname.includes("bing.com")) {
    return document.querySelectorAll(".b_algo h2 a");
  } else if (location.hostname.includes("duckduckgo.com")) {
    return document.querySelectorAll(".result__title a");
  } else {
    return Array.from(document.querySelectorAll("a")).filter(
      (a) => a.href && a.innerText.trim().length > 0 && a.offsetParent !== null
    );
  }
}

// ------------------------------
// Add hover listeners
// ------------------------------
function prepareLinks() {
  getRelevantLinks().forEach((link) => addSafetyOnHover(link));
}

// ------------------------------
// Watch for new dynamic links
// ------------------------------
const observer = new MutationObserver(() => prepareLinks());
observer.observe(document.body, { childList: true, subtree: true });

// ------------------------------
// Add listeners to current links
// ------------------------------
prepareLinks();

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SHOW_PAGE_RESULT") {
    showPageSafetyOverlay(message.result);
  } else if (message.type === "SHOW_HOVER_RESULT") {
    showHoverTooltip(message.url, message.result);
  } else if (message.type === "OPEN_TERMS_PAGE") {
    // Open terms page when received from web dashboard
    chrome.runtime.sendMessage({ type: "OPEN_TERMS_PAGE" });
  }
});

// Listen for postMessage from web pages (dashboard)
window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data.type === "OPEN_TERMS_PAGE") {
    chrome.runtime.sendMessage({ type: "OPEN_TERMS_PAGE" });
  }
});

// Optional: Trigger scan when user hovers on a link (future enhancement)
let currentTooltip = null;
let currentTarget = null;

document.addEventListener("mouseover", (e) => {
  const target = e.target.closest("a");
  if (target && target.href && target.href.startsWith("http")) {
    currentTarget = target;
    chrome.runtime.sendMessage({
      type: "HOVER_URL_CHECK",
      url: target.href,
    });
  }
});

document.addEventListener("mouseout", (e) => {
  const target = e.target.closest("a");
  if (target && currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
    currentTarget = null;
  }
});

function showPageSafetyOverlay(result) {
  if (!result) return;

  const status = result.prediction || result.status;
  const isUnsafe = status === "Unsafe";
  const isError = status === "Error" || !status;

  // Remove any existing overlay before creating a new one
  const oldOverlay = document.getElementById("datashield-warning-overlay");
  if (oldOverlay) oldOverlay.remove();

  if (isUnsafe || isError) {
    const title = isError ? "⚠️ SCAN ERROR" : "🚨 PHISHING WEBSITE DETECTED";
    const message = isError
      ? result.error || "An unknown error occurred while scanning this website."
      : "This website has been identified as a PHISHING SITE. Accessing it may compromise your security, steal your personal information, or install malware on your device.";

    const safePercentage =
      result.safe_percentage ||
      (result.prediction === "Safe" ? 100 - result.confidence * 100 : 0);
    const unsafePercentage =
      result.unsafe_percentage ||
      (result.prediction === "Unsafe" ? result.confidence * 100 : 0);

    const originalBody = document.body;
    originalBody.style.display = "none";

    const overlay = document.createElement("div");
    overlay.id = "datashield-warning-overlay";

    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

      /* Enhanced CSS Variables matching website theme */
      :root {
        --ds-primary-red: hsl(0 84% 60%);
        --ds-secondary-red: hsl(350 89% 60%);
        --ds-accent-orange: hsl(45 93% 47%);
        --ds-electric-blue: hsl(189 100% 50%);
        --ds-neon-purple: hsl(271 81% 56%);
        --ds-safe-green: hsl(142 76% 36%);
        --ds-dark-bg: hsl(222 47% 11%);
        --ds-darker-bg: hsl(222 47% 13%);
        --ds-text-light: hsl(210 40% 98%);
        --ds-text-muted: hsl(215 20% 65%);
        --ds-border: hsl(217 33% 25%);
        --ds-border-radius: 0.75rem;
        --ds-shadow: 0 25px 50px hsla(0, 84%, 60%, 0.4);
        --ds-glow: 0 0 40px hsla(0, 84%, 60%, 0.6);
        --ds-glow-secondary: 0 0 60px hsla(45, 93%, 47%, 0.3);
        --ds-glow-safe: 0 0 40px hsla(142, 76%, 36%, 0.6);
        --gradient-cyber: linear-gradient(135deg, hsl(189 100% 50%), hsl(271 81% 56%));
      }

      /* Advanced animated grid background with multiple layers */
      .ds-grid-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background:
          radial-gradient(circle at 20% 20%, rgba(255, 23, 68, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 80% 80%, rgba(255, 152, 0, 0.15) 0%, transparent 40%),
          radial-gradient(circle at 60% 30%, rgba(0, 255, 255, 0.1) 0%, transparent 35%),
          radial-gradient(circle at 30% 70%, rgba(255, 0, 255, 0.1) 0%, transparent 35%),
          linear-gradient(45deg, transparent 35%, rgba(255, 23, 68, 0.08) 45%, rgba(255, 152, 0, 0.08) 55%, transparent 65%),
          linear-gradient(-45deg, transparent 35%, rgba(0, 255, 255, 0.06) 45%, rgba(255, 0, 255, 0.06) 55%, transparent 65%),
          linear-gradient(90deg, transparent 40%, rgba(255, 23, 68, 0.05) 50%, transparent 60%),
          linear-gradient(0deg, transparent 40%, rgba(255, 152, 0, 0.05) 50%, transparent 60%);
        background-size: 120px 120px, 180px 180px, 150px 150px, 200px 200px, 250px 250px, 300px 300px, 400px 400px, 350px 350px;
        animation: ds-grid-move 25s ease-in-out infinite, ds-color-shift 15s ease-in-out infinite;
        z-index: -1;
        opacity: 0.8;
      }

      @keyframes ds-grid-move {
        0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
        25% { transform: translate(-15px, 15px) rotate(2deg) scale(1.02); }
        50% { transform: translate(15px, -15px) rotate(-2deg) scale(0.98); }
        75% { transform: translate(-8px, 8px) rotate(1deg) scale(1.01); }
      }

      @keyframes ds-color-shift {
        0%, 100% { filter: hue-rotate(0deg) brightness(1); }
        33% { filter: hue-rotate(120deg) brightness(1.1); }
        66% { filter: hue-rotate(240deg) brightness(0.9); }
      }

      /* Main container - full screen */
      .ds-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 999999;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      /* Warning card - full page */
      .ds-warning-card {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, hsl(189 100% 50%), hsl(271 81% 56%));
        animation: ds-card-entrance 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 2rem;
        box-sizing: border-box;
      }

      .ds-warning-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(139, 92, 246, 0.1));
        z-index: -1;
      }

      @keyframes ds-card-entrance {
        from {
          opacity: 0;
          transform: scale(0.8) translateY(50px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      @keyframes ds-border-glow {
        from { opacity: 0.8; }
        to { opacity: 1; }
      }

      @keyframes ds-border-rotate {
        0% { background-position: 0% 50%, 0% 50%; }
        50% { background-position: 100% 50%, 100% 50%; }
        100% { background-position: 0% 50%, 0% 50%; }
      }

      @keyframes ds-shimmer {
        0% { opacity: 0; transform: translateX(-100%); }
        50% { opacity: 1; transform: translateX(0%); }
        100% { opacity: 0; transform: translateX(100%); }
      }

      /* Content styling */
      .ds-content {
        padding: 2rem;
        color: var(--ds-text-light);
        font-family: 'Orbitron', sans-serif;
        max-width: 800px;
        width: 100%;
        text-align: center;
        background: rgba(0, 0, 0, 0.7);
        border-radius: 20px;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        max-height: 80vh;
        overflow-y: auto;
        scrollbar-width: thin;
        scrollbar-color: rgba(0, 255, 255, 0.5) rgba(0, 0, 0, 0.3);
      }

      .ds-content::-webkit-scrollbar {
        width: 8px;
      }

      .ds-content::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
      }

      .ds-content::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, hsl(189 100% 50%), hsl(271 81% 56%));
        border-radius: 10px;
      }

      .ds-content::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, hsl(189 100% 50%, 0.8), hsl(271 81% 56%, 0.8));
      }

      .ds-header {
        text-align: center;
        margin-bottom: 1.5rem;
      }

      .ds-logo {
        width: 250px;
        height: 250px;
        object-fit: contain;
        margin-bottom: 0.5rem;
        margin-top: -5rem;
        margin-right: -1rem;
        filter: drop-shadow(0 0 20px rgba(255, 23, 68, 0.5));
      }

      .ds-warning-icon {
        font-size: 4rem;
        text-align: center;
        margin-bottom: 1rem;
        animation: ds-icon-pulse 2s ease-in-out infinite;
      }

      @keyframes ds-icon-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      .ds-title {
        font-size: 1.8rem;
        font-weight: 900;
        text-align: center;
        margin-bottom: 1rem;
        background:
          linear-gradient(45deg, var(--ds-primary-red), var(--ds-accent-orange), var(--ds-electric-blue), var(--ds-neon-purple)),
          linear-gradient(135deg, var(--ds-primary-red), var(--ds-accent-orange));
        background-size: 400% 400%, 100% 100%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-transform: uppercase;
        letter-spacing: 2px;
        animation: ds-title-glow 3s ease-in-out infinite, ds-title-shift 4s ease-in-out infinite;
        text-shadow:
          0 0 20px rgba(255, 23, 68, 0.5),
          0 0 40px rgba(255, 152, 0, 0.3),
          0 0 60px rgba(0, 255, 255, 0.2);
        position: relative;
      }

      .ds-title::before {
        content: '';
        position: absolute;
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
        background: radial-gradient(circle, rgba(255, 23, 68, 0.1) 0%, transparent 70%);
        border-radius: 50%;
        animation: ds-title-particles 2s ease-in-out infinite;
        pointer-events: none;
      }

      @keyframes ds-title-glow {
        0%, 100% { filter: brightness(1) drop-shadow(0 0 10px rgba(255, 23, 68, 0.5)); }
        50% { filter: brightness(1.2) drop-shadow(0 0 20px rgba(255, 23, 68, 0.8)); }
      }

      @keyframes ds-title-shift {
        0%, 100% { background-position: 0% 50%, 0% 50%; }
        50% { background-position: 100% 50%, 100% 50%; }
      }

      @keyframes ds-title-particles {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.1); }
      }

      .ds-message {
        font-size: 1rem;
        line-height: 1.6;
        text-align: center;
        margin-bottom: 2rem;
        color: var(--ds-text-muted);
        font-weight: 400;
      }

      /* Info grid with improved styling */
      .ds-info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .ds-info-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 23, 68, 0.3);
        border-radius: 12px;
        padding: 1rem;
        transition: all 0.3s ease;
      }

      .ds-info-card:hover {
        background: rgba(255, 23, 68, 0.1);
        border-color: var(--ds-primary-red);
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(255, 23, 68, 0.2);
      }

      .ds-info-card.span-2 {
        grid-column: span 2;
      }

      .ds-info-label {
        display: block;
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--ds-accent-orange);
        margin-bottom: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .ds-info-value {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--ds-text-light);
        word-break: break-all;
      }

      .ds-info-value.danger {
        color: var(--ds-primary-red);
        font-weight: 700;
      }

      .ds-info-value.safe {
        color: #00ff99;
        font-weight: 700;
      }

      /* Buttons with enhanced styling */
      .ds-buttons {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .ds-btn {
        padding: 1rem 1.5rem;
        font-size: 1rem;
        font-weight: 700;
        font-family: 'Orbitron', sans-serif;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
        position: relative;
        overflow: hidden;
      }

      .ds-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
      }

      .ds-btn:hover::before {
        left: 100%;
      }

      .ds-btn-report {
        background:
          linear-gradient(135deg, #ff9800, #f57c00, #ff6f00),
          linear-gradient(45deg, rgba(255, 255, 255, 0.1), transparent);
        background-size: 200% 200%, 100% 100%;
        color: #000;
        box-shadow:
          0 0 20px rgba(255, 152, 0, 0.4),
          0 0 40px rgba(255, 152, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.3);
        animation: ds-btn-report-pulse 2s ease-in-out infinite;
        position: relative;
        overflow: hidden;
      }

      .ds-btn-report::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        animation: ds-btn-shine 3s ease-in-out infinite;
      }

      .ds-btn-report:hover {
        background:
          linear-gradient(135deg, #f57c00, #e65100, #ff5722),
          linear-gradient(45deg, rgba(255, 255, 255, 0.2), transparent);
        background-size: 200% 200%, 100% 100%;
        box-shadow:
          0 0 30px rgba(255, 152, 0, 0.6),
          0 0 60px rgba(255, 152, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.4);
        transform: translateY(-3px) scale(1.02);
        animation: none;
      }

      .ds-btn-proceed {
        background:
          linear-gradient(135deg, #666, #444, #333),
          linear-gradient(45deg, rgba(255, 255, 255, 0.05), transparent);
        background-size: 200% 200%, 100% 100%;
        color: #fff;
        box-shadow:
          0 0 20px rgba(102, 102, 102, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        position: relative;
        overflow: hidden;
      }

      .ds-btn-proceed::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        animation: ds-btn-shine 4s ease-in-out infinite;
      }

      .ds-btn-proceed:hover {
        background:
          linear-gradient(135deg, #777, #555, #444),
          linear-gradient(45deg, rgba(255, 255, 255, 0.1), transparent);
        background-size: 200% 200%, 100% 100%;
        box-shadow:
          0 0 30px rgba(102, 102, 102, 0.6),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
        transform: translateY(-3px) scale(1.02);
      }

      .ds-btn-close {
        background:
          linear-gradient(135deg, var(--ds-primary-red), var(--ds-secondary-red), #b71c1c),
          linear-gradient(45deg, rgba(255, 255, 255, 0.1), transparent);
        background-size: 200% 200%, 100% 100%;
        color: #fff;
        box-shadow:
          0 0 20px rgba(255, 23, 68, 0.4),
          0 0 40px rgba(255, 23, 68, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
        animation: ds-btn-danger-pulse 2s ease-in-out infinite;
        position: relative;
        overflow: hidden;
      }

      .ds-btn-close::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        animation: ds-btn-shine 2.5s ease-in-out infinite;
      }

      .ds-btn-close:hover {
        background:
          linear-gradient(135deg, var(--ds-secondary-red), #b71c1c, #8b0000),
          linear-gradient(45deg, rgba(255, 255, 255, 0.2), transparent);
        background-size: 200% 200%, 100% 100%;
        box-shadow:
          0 0 30px rgba(255, 23, 68, 0.6),
          0 0 60px rgba(255, 23, 68, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.3);
        transform: translateY(-3px) scale(1.02);
        animation: none;
      }

      @keyframes ds-btn-report-pulse {
        0%, 100% { box-shadow: 0 0 20px rgba(255, 152, 0, 0.4), 0 0 40px rgba(255, 152, 0, 0.2); }
        50% { box-shadow: 0 0 25px rgba(255, 152, 0, 0.6), 0 0 50px rgba(255, 152, 0, 0.3); }
      }

      @keyframes ds-btn-danger-pulse {
        0%, 100% { box-shadow: 0 0 20px rgba(255, 23, 68, 0.4), 0 0 40px rgba(255, 23, 68, 0.2); }
        50% { box-shadow: 0 0 25px rgba(255, 23, 68, 0.6), 0 0 50px rgba(255, 23, 68, 0.3); }
      }

      @keyframes ds-btn-shine {
        0% { left: -100%; }
        50% { left: 100%; }
        100% { left: 100%; }
      }

      .ds-warning-footer {
        text-align: center;
        font-size: 0.85rem;
        color: var(--ds-text-muted);
        font-weight: 500;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 23, 68, 0.3);
      }

      /* Hover tooltip styles */
      .ds-hover-tooltip {
        position: absolute;
        z-index: 1000000;
        pointer-events: none;
        font-family: 'Orbitron', sans-serif;
        font-size: 12px;
        font-weight: bold;
        border-radius: 8px;
        padding: 10px 14px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
        animation: tooltipFadeIn 0.3s ease-out;
        max-width: 220px;
        word-wrap: break-word;
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
      }

      @keyframes tooltipFadeIn {
        from { opacity: 0; transform: translateY(8px) scale(0.9); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .ds-hover-tooltip-safe {
        background: linear-gradient(135deg, rgba(0, 255, 153, 0.9), rgba(0, 204, 119, 0.9));
        color: #000;
        border: 2px solid #00ff99;
        box-shadow: 0 6px 16px rgba(0, 255, 153, 0.3);
      }

      .ds-hover-tooltip-unsafe {
        background: linear-gradient(135deg, rgba(255, 68, 68, 0.9), rgba(204, 0, 0, 0.9));
        color: #fff;
        border: 2px solid #ff4444;
        box-shadow: 0 6px 16px rgba(255, 68, 68, 0.3);
      }

      .ds-hover-tooltip-error {
        background: linear-gradient(135deg, rgba(255, 165, 0, 0.9), rgba(255, 140, 0, 0.9));
        color: #000;
        border: 2px solid #ffa500;
        box-shadow: 0 6px 16px rgba(255, 165, 0, 0.3);
      }

      .ds-hover-tooltip-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .ds-hover-tooltip-icon {
        font-size: 16px;
      }

      .ds-hover-tooltip-confidence {
        font-size: 11px;
        opacity: 0.9;
        margin-left: 6px;
        font-weight: 600;
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .ds-container {
          padding: 1rem;
        }

        .ds-content {
          padding: 1.5rem;
        }

        .ds-info-grid {
          grid-template-columns: 1fr;
        }

        .ds-info-card.span-2 {
          grid-column: span 1;
        }

        .ds-title {
          font-size: 1.5rem;
        }

        .ds-buttons {
          gap: 0.75rem;
        }

        .ds-btn {
          padding: 0.875rem 1.25rem;
          font-size: 0.9rem;
        }
      }
    `;

    // Use your exact original overlay HTML
    overlay.innerHTML = `
      ${document.querySelector("#datashield-warning-overlay-template")
        ? document.querySelector("#datashield-warning-overlay-template").innerHTML
        : `
      <div class="ds-grid-overlay"></div>
      <div class="ds-container">
        <div class="ds-warning-card">
          <div class="ds-content">
            <div class="ds-header">
              <img src="${chrome.runtime.getURL(
                "DataShield.Ai-removebg-preview.png"
              )}" alt="DataShield Logo" class="ds-logo" />
            </div>

            <div class="ds-warning-icon">${isError ? "⚠️" : "🚨"}</div>

            <h1 class="ds-title">${title}</h1>

            <p class="ds-message">${message}</p>

            <div class="ds-info-grid">
              <div class="ds-info-card span-2">
                <strong class="ds-info-label">🔗 Source URL</strong>
                <span class="ds-info-value" title="${result.url || ""}">
                  ${result.url || "N/A"}
                </span>
              </div>

              <div class="ds-info-card span-2">
                <strong class="ds-info-label">🔄 Redirected URL</strong>
                <span class="ds-info-value" title="${result.redirectedUrl || ""}">
                  ${result.redirectedUrl || "N/A"}
                </span>
              </div>

              <div class="ds-info-card">
                <strong class="ds-info-label">🌐 IP Address</strong>
                <span class="ds-info-value">${result.ip_address || "N/A"}</span>
              </div>

              <div class="ds-info-card">
                <strong class="ds-info-label">🏢 ASN</strong>
                <span class="ds-info-value">${result.asn || "N/A"}</span>
              </div>

              <div class="ds-info-card span-2">
                <strong class="ds-info-label">📍 Location</strong>
                <span class="ds-info-value">
                  ${result.location || "N/A"} ${
        result.country_code ? `(${result.country_code})` : ""
      }
                </span>
              </div>

              <div class="ds-info-card">
                <strong class="ds-info-label">⚠️ Confidence</strong>
                <span class="ds-info-value danger">
                  ${result.confidence ? (result.confidence * 100).toFixed(2) : "N/A"}%
                </span>
              </div>

              <div class="ds-info-card">
                <strong class="ds-info-label">🛡️ Safe Score</strong>
                <span class="ds-info-value safe">
                  ${safePercentage?.toFixed(2) ?? "N/A"}%
                </span>
              </div>

              <div class="ds-info-card">
                <strong class="ds-info-label">☠️ Unsafe Score</strong>
                <span class="ds-info-value danger">
                  ${unsafePercentage?.toFixed(2) ?? "N/A"}%
                </span>
              </div>
            </div>

            <div class="ds-buttons">
              <button id="proceedBtn" class="ds-btn ds-btn-proceed">
                Proceed Anyway (Not Recommended)
              </button>
              <button id="closeBtn" class="ds-btn ds-btn-close">
                Close Tab
              </button>
            </div>

            <p class="ds-warning-footer">
              ⚠️ Warning: Proceeding may expose you to security risks
            </p>
          </div>
        </div>
      </div>`}`;

    document.head.appendChild(style);
    document.documentElement.appendChild(overlay);

    document.getElementById("proceedBtn").onclick = () => {
      overlay.remove();
      style.remove();
      originalBody.style.display = "block";

      const warningStyle = document.createElement("style");
      warningStyle.textContent = `
        .ds-persistent-warning {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(135deg, #ff4444, #cc0000);
          color: white;
          text-align: center;
          padding: 0.75rem 1rem;
          font-family: 'Orbitron', sans-serif;
          font-weight: bold;
          font-size: 0.9rem;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          animation: warningBlink 2s ease-in-out infinite;
        }
        @keyframes warningBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .ds-persistent-warning button {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
        }
      `;

      const warningIndicator = document.createElement("div");
      warningIndicator.className = "ds-persistent-warning";
      warningIndicator.innerHTML = `
        <span>⚠️ WARNING: You are on a potentially unsafe website.</span>
        <button onclick="this.parentElement.remove()">✕</button>
      `;
      document.head.appendChild(warningStyle);
      document.body.appendChild(warningIndicator);
    };

    document.getElementById("closeBtn").onclick = () => {
      chrome.runtime.sendMessage({ type: "CLOSE_TAB" });
    };
  } else if (status === "Safe") {
    // safe toast notification logic
    const safeStyle = document.createElement("style");
    safeStyle.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
      .ds-safe-toast { position: fixed; bottom: 20px; right: 20px; padding: 1rem 1.5rem;
        background: rgba(10,14,39,0.95); border: 2px solid #00ff99; border-radius: 12px;
        box-shadow: 0 0 30px rgba(0,255,153,0.3); color: #00ff99; z-index: 99999999;
        display: flex; align-items: center; gap: 1rem; opacity: 0; transform: translateY(20px);
        transition: all 0.5s ease-out; font-family: 'Orbitron', sans-serif; }
      .ds-safe-toast.show { opacity: 1; transform: translateY(0); }
      .ds-safe-icon { width: 40px; height: 40px; background: linear-gradient(135deg,#00ff99,#00cc77);
        border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #0a0e27; }
      .ds-safe-close { background: none; border: none; color: #00ff99; font-size: 1.5rem; cursor: pointer; }
    `;

    const safeToast = document.createElement("div");
    safeToast.className = "ds-safe-toast";
    safeToast.innerHTML = `
      <div class="ds-safe-icon">✓</div>
      <div><strong>Safe Website</strong><br/><small>Scanned by DataShield.AI</small></div>
      <button class="ds-safe-close">×</button>
    `;

    document.head.appendChild(safeStyle);
    document.body.appendChild(safeToast);
    setTimeout(() => safeToast.classList.add("show"), 50);
    const autoDismiss = setTimeout(() => {
      safeToast.classList.remove("show");
      setTimeout(() => {
        safeToast.remove();
        safeStyle.remove();
      }, 500);
    }, 5000);

    safeToast.querySelector(".ds-safe-close").onclick = () => {
      clearTimeout(autoDismiss);
      safeToast.classList.remove("show");
      setTimeout(() => {
        safeToast.remove();
        safeStyle.remove();
      }, 500);
    };
  }
}

function showHoverTooltip(url, result) {
  if (!currentTarget || currentTooltip) return;

  const status = result.prediction || result.status;
  const isUnsafe = status === "Unsafe";
  const isError = status === "Error" || !status;
  const isSafe = status === "Safe";

  let tooltipText = "";
  let tooltipClass = "";
  let icon = "";

  if (isSafe) {
    tooltipText = "✓ Safe Website";
    tooltipClass = "ds-hover-tooltip-safe";
    icon = "✓";
  } else if (isUnsafe) {
    tooltipText = "🚨 Potential Phishing";
    tooltipClass = "ds-hover-tooltip-unsafe";
    icon = "🚨";
  } else if (isError) {
    tooltipText = "⚠️ Scan Error";
    tooltipClass = "ds-hover-tooltip-error";
    icon = "⚠️";
  }

  const tooltip = document.createElement("div");
  tooltip.className = `ds-hover-tooltip ${tooltipClass}`;
  tooltip.innerHTML = `
    <div class="ds-hover-tooltip-content">
      <span class="ds-hover-tooltip-icon">${icon}</span>
      <span class="ds-hover-tooltip-text">${tooltipText}</span>
      ${result.confidence ? `<span class="ds-hover-tooltip-confidence">${(result.confidence * 100).toFixed(0)}%</span>` : ""}
    </div>
  `;

  // Position tooltip near the link
  const rect = currentTarget.getBoundingClientRect();
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.top = `${rect.top + window.scrollY - 40}px`;

  document.body.appendChild(tooltip);
  currentTooltip = tooltip;

  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (currentTooltip === tooltip) {
      tooltip.remove();
      currentTooltip = null;
    }
  }, 3000);
}
