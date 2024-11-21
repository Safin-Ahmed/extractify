# Extractify Backend Application

This backend application extracts accurate email from a linkedin profile, generates professional LinkedIn connection request messages using OpenAI, and provides an API for interacting with the system.

## Features

- **Email Finding and Verficiation**:
  - Finds the accurate work email address from the internet.
  - Checks domain MX records.
  - Performs SMTP validation for deliverability.
- **OpenAI Integration**:
  - Generates LinkedIn connection request messages tailored for professional outreach based on the provided email address.

---

## Installation

### Prerequisites

- **Node.js**: Ensure you have Node.js installed (version 16+ recommended).
- **npm**: Comes bundled with Node.js.

### Steps to Run

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd server

   ```

2. Install dependencies

   ```
   yarn

   ```

3. Setup environment variables
   - Create a .env file in the root directory:
     ```
     touch .env
     ```
   - Add the following variables:
     ```
     OPENAI_API_KEY=API_KEY
     ABSTRACT_API_KEY=API_KEY
     ```
4. Start the server
   ```
   yarn dev
   ```

<br />

## API Endpoints

1. Find Email

   - **Endpoint**: <code style="color: #ddd">/api/find-email</code>
     - Method : POST
     - Request Body:
       ```
       "name": string
       "company": string
       "websites": string[]
       "companyDomain": string
       ```
     - Response:
       ```
           "success": boolean;
           "emails": string[];
       ```

2. Submit Email
   - **Endpoint**: <code style="color: #ddd">/api/submit-email</code>
     - Method: POST
     - Request Body:
       ```
       "email": string
       ```
     - Response:
       ```
       "success": boolean;
       "message": string;
       ```

<br />

## Technologies Used

    - Express.js: Backend Library
    - OPEN AI API: For Message Generation
    - Abstract API: For Email Verification withSMTP

<br/>

## Folder Structure

```bash

server/src
├── app.js          # Express App
├── index.js        # Main entry point
├── controllers     # All the controllers of the app
├── routes          # All the routes of the app
├── services        # All the services of the app
├── utils           # All the utility function of the app
├── middlewares     # All the middlewares of the app

```
