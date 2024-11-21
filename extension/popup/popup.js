class PopupManager {
  constructor() {
    this.extractButton = document.getElementById("extractButton");
    this.emailResult = document.getElementById("emailResult");
    this.copyButton = document.getElementById("copyButton");
    this.status = document.getElementById("status");
    this.loading = document.getElementById("loading");
    this.messageContainer = document.getElementById("messageContainer");
    this.generatedMessage = document.getElementById("generatedMessage");
    this.copyMessageButton = document.getElementById("copyMessageButton");

    this.API_URL = "http://localhost:4000/api";

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.extractButton.addEventListener("click", () => this.extractEmail());
    this.copyButton.addEventListener("click", () =>
      this.copyToClipboard(this.emailResult)
    );
    this.copyMessageButton.addEventListener("click", () =>
      this.copyToClipboard(this.generatedMessage)
    );
  }

  async extractEmail() {
    this.emailResult.value = "";
    this.messageContainer.classList.remove("visible");
    this.messageContainer.classList.add("hidden");
    this.generatedMessage.value = "";
    try {
      this.updateStatus("Extracting email...", "progress");
      this.showLoadingState();

      // Get active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.url.includes("linkedin.com/in/")) {
        throw new Error("Please navigate to a LinkedIn profile page");
      }

      // Execute content script
      const result = await chrome.tabs.sendMessage(tab.id, {
        action: "extractEmail",
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to extract email");
      }

      if (result.company || result.companyDomain) {
        result.emails = this.filterEmailsByFullName(
          result.emails,
          result.fullName
        );
      }

      if (result.emails.length === 0) {
        // Call your backend or external API for online search
        const searchResponse = await fetch(
          "http://localhost:4000/api/find-email",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: result.fullName,
              profileName: result.profileName,
              company: result.company,
              websites: result.websites ? result.websites : null,
              companyDomain: result.companyDomain,
            }),
          }
        );

        const searchResult = await searchResponse.json();

        if (searchResult.success && searchResult.emails.length > 0) {
          this.emailResult.value = searchResult.emails[0];
          this.updateStatus("Email found online!", "success");
        } else {
          throw new Error(searchResult.message || "Email not found online");
        }
      }

      if (result.emails.length > 0) {
        this.emailResult.value = result.emails[0];
        this.updateStatus("Email extracted successfully!", "success");
      }

      this.updateStatus("Generating customized message...", "progress");

      // Send the email to backend api for acknowledgement
      const apiResponse = await this.sendEmailForAcknowledgement(
        this.emailResult.value
      );

      // Show response in the generated message container
      this.showGeneratedMessage(apiResponse?.message);

      this.updateStatus(
        "Extraction and message generation complete!",
        "success"
      );
    } catch (error) {
      console.log({ error });
      this.updateStatus(error.message, "error");
    } finally {
      this.hideLoadingState();
    }
  }

  async sendEmailForAcknowledgement(email) {
    try {
      const response = await fetch(`${this.API_URL}/submit-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error("Failed to send email to backend API");
    }
  }

  async copyToClipboard(element) {
    try {
      await navigator.clipboard.writeText(element.value);
      this.updateStatus("Copied to clipboard!", "success");
      setTimeout(() => this.updateStatus("Ready to extract email"), 2000);
    } catch (error) {
      this.updateStatus("Failed to copy to clipboard", error);
    }
  }

  updateStatus(message, type = "") {
    this.status.textContent = message;
    this.status.className = "status";

    if (type) {
      this.status.classList.add(type);
    }
  }

  showGeneratedMessage(message) {
    this.generatedMessage.value = message;
    this.messageContainer.classList.remove("hidden");
    this.messageContainer.classList.add("visible");
  }

  showLoadingState() {
    // Show a loading spinner and disable buttons
    this.loading.classList.add("visible");
    this.extractButton.disabled = true;
    this.copyButton.disabled = true;
    this.copyMessageButton.disabled = true;
  }

  hideLoadingState() {
    // Remove loading spinner and enable buttons
    this.loading.classList.remove("visible");
    this.extractButton.disabled = false;
    this.copyButton.disabled = false;
    this.copyMessageButton.disabled = false;
  }

  filterEmailsByFullName(emails, fullName) {
    const nameParts = fullName.toLowerCase().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];

    if (!emails || emails?.length === 0) return [];

    return emails.filter((email) => {
      const emailLower = email.toLowerCase();

      // Check if the email contains the first name, last name, or initials
      return (
        emailLower.includes(firstName) ||
        emailLower.includes(lastName) ||
        emailLower.includes(`${firstName[0]}${lastName}`) ||
        emailLower.includes(`${lastName}${firstName[0]}`)
      );
    });
  }
}

// Initialize Popup

document.addEventListener("DOMContentLoaded", () => {
  new PopupManager();
});
