// background.js
chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes("linkedin.com/in/")) {
    // Send message to content script to extract email
    chrome.tabs.sendMessage(tab.id, { action: "extractEmail" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }

      if (response && response.success) {
        if (response.emails.length > 0) {
          // Copy first email to clipboard
          navigator.clipboard.writeText(response.emails[0]).then(() => {
            // Optionally show a notification
            chrome.notifications.create({
              type: "basic",
              iconUrl: "path/to/icon.png",
              title: "Email Extracted",
              message: `Copied ${response.emails[0]} to clipboard`,
            });
          });
        } else {
          chrome.notifications.create({
            type: "basic",
            iconUrl: "path/to/icon.png",
            title: "No Email Found",
            message: "Could not find an email address on this profile",
          });
        }
      }
    });
  } else {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "path/to/icon.png",
      title: "Invalid Page",
      message: "Please navigate to a LinkedIn profile",
    });
  }
});
