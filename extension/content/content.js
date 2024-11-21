class LinkedInEmailExtractor {
  constructor() {
    this.emailPatterns = [
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
      /mailto:([^"]+)/gi,
    ];
  }

  async extract() {
    try {
      // check if we're on a linkedin profile page
      if (!window.location.href.includes("linkedin.com/in/")) {
        return { success: false, error: "Not a LinkedIn profile page" };
      }

      const emails = new Set();
      let websiteList = [];
      let companyDomain = null;

      const profileURL = new URL(window.location.href);
      const profileName = profileURL.pathname.split("/")[2];

      // Method 1: check for mailto links
      const mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');
      mailtoLinks.forEach((link) => {
        const email = link.href.replace("mailto:", "").trim();
        if (this.isValidEmail(email)) {
          emails.add(email);
        }
      });

      // Method 2: Scan visible text content
      const textContent = document.body.innerText;
      this.emailPatterns.forEach((pattern) => {
        const matches = textContent.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            const email = match.replace("mailto:", "").trim();
            if (this.isValidEmail(email)) {
              emails.add(email);
            }
          });
        }
      });

      // Method 3: Check contact info section if available
      const contactInfoButton = Array.from(document.querySelectorAll("a")).find(
        (button) => button.textContent.includes("Contact info")
      );

      if (contactInfoButton && emails.size === 0) {
        contactInfoButton.click();

        const modalOutlet = document.querySelector("#artdeco-modal-outlet");
        if (modalOutlet) {
          modalOutlet.style.visibility = "hidden";
        }

        // Wait for modal to open
        await new Promise((resolve) => setTimeout(resolve, 500));

        const modalEmails = document.querySelectorAll('a[href^="mailto:"]');
        console.log({ modalEmails });
        modalEmails.forEach((link) => {
          const email = link.href.replace("mailto:", "").trim();
          console.log({ email });
          if (this.isValidEmail(email)) {
            emails.add(email);
          }
        });

        const websiteLink = document.querySelector(
          "a.pv-contact-info__contact-link"
        );

        if (websiteLink) {
          const companyFlag = websiteLink.closest("li").querySelector("span");
          if (companyFlag && companyFlag.textContent.includes("Company")) {
            websiteList.push({ type: "company", url: websiteLink.href });
            companyDomain = websiteLink.href;
          } else {
            websiteList.push({ type: "personal", url: websiteLink.href });
          }
        }

        // close the modal
        const closeButton = document.querySelector(
          'button[aria-label="Dismiss"]'
        );

        if (closeButton) {
          closeButton.click();
        }

        if (modalOutlet) {
          modalOutlet.style.visibility = "visible";
        }
      }

      // Check if the profile has any website link in the front page
      const frontWebsiteElement = document.querySelector(
        '.pv-top-card--website a[href^="http"]'
      );
      if (frontWebsiteElement) {
        websiteList.push({ type: "front", url: frontWebsiteElement?.href });
      }

      const emailsArray = Array.from(emails);
      return {
        success: true,
        emails: emailsArray,
        fullName: this.extractProfileName(),
        profileName,
        currentRole: this.extractCurrentRole(),
        company: this.extractCompany(),
        companyDomain,
        websites: websiteList && websiteList.length > 0 ? websiteList : null,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  extractProfileName() {
    const nameElement = document.querySelector("h1");
    return this.sanitizeName(nameElement ? nameElement.textContent.trim() : "");
  }

  extractCurrentRole() {
    const roleElement = document.querySelector(".text-body-medium");
    return roleElement ? roleElement.textContent.trim() : "";
  }

  extractCompany() {
    const role = this.extractCurrentRole();
    const company =
      role && role?.includes(" @ ")
        ? role?.split(" @ ")[1]?.trim()
        : role && role.toLowerCase()?.includes(" at ")
        ? role.toLowerCase()?.split(" at ")[1]?.trim()
        : null;

    return company
      ?.split("-")?.[0]
      ?.trim()
      ?.split("|")?.[0]
      ?.trim()
      .replace(/\s?\(.*?\)$/, "");
  }

  sanitizeName(name) {
    // Remove emojis using their Unicode ranges
    return name.replace(/[^\w\s'-\.]|[\uD800-\uDFFF]/g, "").trim();
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractEmail") {
    const extractor = new LinkedInEmailExtractor();
    extractor.extract().then(sendResponse);
    return true;
  }
});
