const axios = require("axios");

/**
 * This function is responsible for filtering emails by ensuring the email contains the specific person's name
 * @param {String} emails
 * @param {String} fullName
 * @returns String[]
 */
function filterEmailsByFullName(emails, fullName) {
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

/**
 * This Function Is Responsible To Verify Email Address using SMTP handshake
 * @param {String} email
 * @returns Boolean
 */
async function verifyEmailDeliverability(email) {
  const response = await axios.get(
    `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_API_KEY}&email=${email}`
  );

  if (
    response.data?.is_mx_found?.value &&
    response.data?.is_smtp_valid?.value
  ) {
    return true;
  } else {
    return false;
  }
}

/**
 * This Function is responsible for generating multiple email patterns by combining fullname and domain name
 * @param {String} fullName
 * @param {String} domain
 * @returns
 */
function generateEmailPatterns(fullName, domain) {
  const nameParts = fullName.toLowerCase().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];

  // Generate common email patterns
  const patterns = [
    `${firstName}.${lastName}@${domain}`,
    `${firstName}@${domain}`,
    `${lastName}@${domain}`,
    `${firstName[0]}${lastName}@${domain}`,
    `${firstName}${lastName[0]}@${domain}`,
    `${lastName}${firstName[0]}@${domain}`,
  ];

  return patterns;
}

module.exports = {
  filterEmailsByFullName,
  verifyEmailDeliverability,
  generateEmailPatterns,
};
