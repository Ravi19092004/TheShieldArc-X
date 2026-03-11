document.addEventListener('DOMContentLoaded', function () {
  // Check login status and terms acceptance
  chrome.storage.local.get(['extensionToken', 'termsAccepted'], function (result) {
    if (!result.extensionToken) {
      // No token stored, check web login status
      checkWebLoginStatus();
      return;
    }

    if (!result.termsAccepted) {
      // Logged in but terms not accepted, redirect to web terms page
      chrome.tabs.create({ url: "http://localhost:3000/terms" });
      window.close(); // Close the popup
      return;
    }

    // Terms accepted, proceed with normal popup functionality
    proceedWithPopup();
  });
});

function checkWebLoginStatus() {
  // Check if user is logged in on the web app
  fetch('http://localhost:3000/api/extension-session', {
    method: 'GET',
    credentials: 'include', // Include cookies for session
  })
  .then(response => response.json())
  .then(data => {
    if (data.loggedIn && data.token) {
      // User is logged in on web, store token and check terms
      chrome.storage.local.set({
        extensionToken: data.token,
        userId: data.user.id,
        userEmail: data.user.email,
        userName: data.user.name,
      }, () => {
        // Check if terms are accepted
        fetch('http://localhost:3000/api/user/accept-terms', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.token}`,
          },
        })
        .then(termsResponse => termsResponse.json())
        .then(termsData => {
          if (termsData.termsAccepted) {
            // Terms accepted, store and proceed with popup
            chrome.storage.local.set({ termsAccepted: true }, () => {
              proceedWithPopup();
            });
          } else {
            // Terms not accepted, redirect to terms page
            chrome.tabs.create({ url: 'http://localhost:3000/terms' });
            window.close();
          }
        })
        .catch(termsError => {
          console.error('Error checking terms:', termsError);
          // On terms check error, redirect to terms page
          chrome.tabs.create({ url: 'http://localhost:3000/terms' });
          window.close();
        });
      });
    } else {
      // Not logged in anywhere, redirect to web login page
      chrome.tabs.create({ url: 'http://localhost:3000/login' });
      window.close();
    }
  })
  .catch(error => {
    console.error('Error checking web login status:', error);
    // On error, assume not logged in and redirect to web login
    chrome.tabs.create({ url: 'http://localhost:3000/login' });
    window.close();
  });
}

function proceedWithPopup() {
  // Query for the active tab in the current window
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    if (!tab || !tab.url) {
      updateUIForNoURL();
      return;
    }

    // Show loading state
    updateUIWithLoading();

    // --- FIX: Pass the tab URL to update functions ---
    updateUIWithData({ url: tab.url }); // Initialize with URL

    // Send a message to the background script to get the URL status
    chrome.runtime.sendMessage(
      { type: 'GET_URL_STATUS', url: tab.url },
      function (response) {
        if (chrome.runtime.lastError) {
          console.error('Error getting URL status:', chrome.runtime.lastError);
          updateUIWithError('Could not get a response from the background script.');
          return;
        }
        updateUIWithData(response);
      }
    );
  });

  // Button click handler
  const manageBtn = document.getElementById('manageBtn');
  if (manageBtn) {
    manageBtn.addEventListener('click', function () {
      // Replace with the actual URL of your dashboard
      chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
    });
  }

  // Start real-time updates for IP location and security
  startRealTimeUpdates();
}

function startRealTimeUpdates() {
  // Update every 10 seconds
  setInterval(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (!tab || !tab.url) {
        return;
      }

      chrome.runtime.sendMessage(
        { type: 'GET_URL_STATUS', url: tab.url },
        function (response) {
          if (chrome.runtime.lastError) {
            console.error('Error getting URL status:', chrome.runtime.lastError);
            return;
          }
          updateRealTimeData(response);
        }
      );
    });
  }, 10000); // 10 seconds
}

function updateUIWithLoading() {
  const trustText = document.getElementById('trust-text');
  if (trustText) trustText.textContent = 'ANALYZING...';
  const sourceUrl = document.getElementById('source-url');
  if (sourceUrl) sourceUrl.textContent = 'loading...';
  const ipAddress = document.getElementById('ip-address');
  if (ipAddress) ipAddress.textContent = '...';
  const asn = document.getElementById('asn');
  if (asn) asn.textContent = '...';
  const location = document.getElementById('location');
  if (location) location.textContent = '...';
  const country = document.getElementById('country');
  if (country) country.textContent = '...';
  const city = document.getElementById('city');
  if (city) city.textContent = '...';
  const isp = document.getElementById('isp');
  if (isp) isp.textContent = '...';
  const timezone = document.getElementById('timezone');
  if (timezone) timezone.textContent = '...';
  const confidenceScore = document.getElementById('confidence-score');
  if (confidenceScore) confidenceScore.textContent = '--%';
}

function updateUIForNoURL() {
  const trustText = document.getElementById('trust-text');
  const trustSubtitle = document.getElementById('trust-subtitle');
  if (trustText) trustText.textContent = 'NO URL';
  if (trustSubtitle) trustSubtitle.textContent = 'Cannot scan this page';
  const sourceUrl = document.getElementById('source-url');
  if (sourceUrl) sourceUrl.textContent = 'N/A';
}

function updateUIWithError(errorMessage) {
  const trustText = document.getElementById('trust-text');
  const trustSubtitle = document.getElementById('trust-subtitle');
  const sourceUrl = document.getElementById('source-url');
  if (trustText) trustText.textContent = 'ERROR';
  if (trustSubtitle) trustSubtitle.textContent = 'Scan failed';
  if (sourceUrl) sourceUrl.textContent = errorMessage || 'An unknown error occurred.';
}

function updateUIWithData(result) {
  // --- FIX: Always update URL first ---
  const url = result.url || 'N/A';
  const truncatedUrl = url.length > 30 ? url.substring(0, 27) + '...' : url;
  const sourceUrl = document.getElementById('source-url');
  if (sourceUrl) {
    sourceUrl.textContent = truncatedUrl;
    sourceUrl.title = url;
  }

  if (!result || result.status === 'Error') {
    updateUIWithError(result?.error);
    return;
  }

  const status = result.prediction || result.status;
  const trustText = document.getElementById('trust-text');
  const trustSubtitle = document.getElementById('trust-subtitle');
  const trustIcon = document.querySelector('.trust-icon');

  // Create and append confidence score to the trust card subtitle
  const confidenceText = result.confidence ? ` (Confidence: ${(result.confidence * 100).toFixed(0)}%)` : '';


  if (trustText) {
    switch (status) {
      case 'Safe':
        trustText.textContent = 'SECURE';
        trustText.style.color = '#00ff99';
        if (trustSubtitle) trustSubtitle.textContent = 'Connection Protected' + confidenceText;
        if (trustIcon) trustIcon.textContent = '🛡️';
        break;
      case 'Unsafe':
        trustText.textContent = 'UNSAFE';
        trustText.style.color = '#ff4444';
        if (trustSubtitle) trustSubtitle.textContent = 'Phishing Detected' + confidenceText;
        if (trustIcon) trustIcon.textContent = '☠️';
        break;
      default:
        trustText.textContent = 'UNKNOWN';
        if (trustSubtitle) trustSubtitle.textContent = 'Could not determine status';
        if (trustIcon) trustIcon.textContent = '👀';
        break;
    }
  }

  // Update all data including real-time sections
  updateRealTimeData(result);
}

function updateRealTimeData(result) {
  // Truncate long URLs
  const url = result.url || 'N/A';
  const truncatedUrl = url.length > 30 ? url.substring(0, 27) + '...' : url;

  const sourceUrl = document.getElementById('source-url');
  if (sourceUrl) {
    sourceUrl.textContent = truncatedUrl;
    sourceUrl.title = url;
  }
  const ipAddress = document.getElementById('ip-address');
  if (ipAddress) ipAddress.textContent = result.ip_address || 'N/A';
  const asn = document.getElementById('asn');
  if (asn) asn.textContent = result.asn || 'N/A';
  const location = document.getElementById('location');
  if (location) location.textContent = result.location || 'N/A';

  // --- USE USER'S OWN LOCATION FOR SESSION INFO ---
  const country = document.getElementById('country');
  if (country) country.textContent = result.user_country || 'N/A';
  const city = document.getElementById('city');
  if (city) city.textContent = result.user_city || 'N/A';
  const isp = document.getElementById('isp');
  if (isp) isp.textContent = result.user_isp || 'N/A';

  // Use user's timezone from background script instead of browser
  const timezoneEl = document.getElementById('timezone');
  if (timezoneEl) {
    timezoneEl.textContent = result.user_timezone || 'N/A';
  }

  // Update real-time security statuses based on data
  updateSecurityStatuses(result);
}

function updateSecurityStatuses(result) {
  const securityItems = document.querySelectorAll('.security-item');

  // IP tracking active - always true if we have IP data
  const ipTracking = securityItems[0];
  if (ipTracking) {
    const icon = ipTracking.querySelector('.security-status-icon');
    const span = ipTracking.querySelector('span');
    if (result.ip_address && result.ip_address !== 'N/A') {
      icon.textContent = '📡';
      span.textContent = 'IP tracking active';
    } else {
      icon.textContent = '⏳';
      span.textContent = 'IP tracking pending';
    }
  }

  // Location monitoring - true if we have location data
  const locationMonitoring = securityItems[1];
  if (locationMonitoring) {
    const icon = locationMonitoring.querySelector('.security-status-icon');
    const span = locationMonitoring.querySelector('span');
    if (result.city && result.city !== 'N/A') {
      icon.textContent = '🌍';
      span.textContent = 'Location monitoring active';
    } else {
      icon.textContent = '⏳';
      span.textContent = 'Location monitoring pending';
    }
  }

  // Session protection - based on prediction status
  const sessionProtection = securityItems[2];
  if (sessionProtection) {
    const icon = sessionProtection.querySelector('.security-status-icon');
    const span = sessionProtection.querySelector('span');
    if (result.prediction === 'Safe') {
      icon.textContent = '🛡️';
      span.textContent = 'Session protection active';
    } else if (result.prediction === 'Unsafe') {
      icon.textContent = '🚨';
      span.textContent = 'Session protection alert';
    } else {
      icon.textContent = '👀';
      span.textContent = 'Session protection monitoring';
    }
  }
}
