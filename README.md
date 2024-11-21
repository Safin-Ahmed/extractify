# Extractify Browser Extension

A browser extension that extracts emails from LinkedIn profiles, verifies their deliverability, and generates professional connection request messages.

---

## Features

- **Email Extraction**:
  - Extract emails from LinkedIn profiles' contact info modal.
  - Scrapes emails from publicly available information.
- **Email Verification**:
  - Validates email syntax, domain, and deliverability.
- **OpenAI-Powered Message Generation**:
  - Generates tailored LinkedIn connection request messages.

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd extension
   ```
2. Load the extension into Chrome
   - Open <code>chrome://extensions/</code>
   - Enable Developer mode
   - Click Load unpacked and select the extension directory
3. Make sure the backend server is running (Required). For details go to the server directory of this project.

<br />

## How to Use

1. Open LinkedIn Profile:
   - Navigate to any Linkedin profile
2. Extract Emails:

   - Click the extension icon and press the Extract Email Button

   - If an email is found, it will be displayed in the extension popup.

3. Generate LinkedIn Message:
   - After email extraction, it will auto generate the linkedin connection request message based on the profile's work email address
