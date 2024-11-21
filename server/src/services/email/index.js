const { delay } = require("../../utils");
const {
  filterEmailsByFullName,
  generateEmailPatterns,
  verifyEmailDeliverability,
} = require("../../utils/email");
const {
  scrapeWebsitesToGetEmails,
  searchGoogle,
  getCompanyDomain,
} = require("../../utils/scrape");

class EmailService {
  constructor() {}

  async findEmail(payload) {
    // Extract necessary payload
    let { name, company, websites, companyDomain } = payload;

    console.log({ name, company, websites, companyDomain });

    // List for collecting and filtering potential emails
    let emails = [];
    try {
      // Step 1: First we will try to check the websites that the user has attached to this profiles
      if (websites && websites.length > 0) {
        emails = await scrapeWebsitesToGetEmails(websites);

        // filter the emails using profile full name to ensure that the email address belongs to the correct person
        emails = filterEmailsByFullName(emails, name);

        if (emails && emails.length > 0) return emails;
      }

      // Step 2: If no emails are found in the previous step, we will try to search for user's email in google
      emails = await searchGoogle(`${name} ${company} email`);
      // filter the emails using profile full name to ensure that the email address belongs to the correct person
      emails = filterEmailsByFullName(emails, name);

      if (emails && emails.length > 0) return emails;

      // If there was no company domain url attached to the request, then we will get the company domain by google search using company name
      if (!companyDomain) {
        // add delay of 3s before doing the google search so that we don't git captcha error
        await delay(3000);
        companyDomain = await getCompanyDomain(
          `${company} official website`,
          company
        );
      }

      // Check if there is no valid company domain, because sometimes we might return empty handed due to google captcha error or anything unusual
      if (!companyDomain)
        // we will guess the domain name from company name
        companyDomain = `www.${company
          ?.toLowerCase()
          ?.replace(/\s+/g, "")}.com`;

      // Step 3: Generate an email address with the full name and company domain
      const emailPatterns = generateEmailPatterns(
        name,
        companyDomain?.split(".")[1] + ".com" || company?.toLowerCase() + ".com"
      );

      // Step 4: Verify Each Email
      let validEmails = [];
      for (const email of emailPatterns) {
        // We will check each pattern of email to make sure the smtp handshake works for that one correct email id
        const isValid = await verifyEmailDeliverability(email);

        if (isValid) {
          validEmails.push(email);
          break;
        }

        // We are using a delay of 1s because the smtp server we are using to verify emails has a rate limiting for 1 request per second
        await delay(1000);
      }

      // Filters the email list with profile full name to make sure it belongs to the correct person
      validEmails = filterEmailsByFullName(validEmails, name);

      if (validEmails && validEmails.length > 0) {
        return validEmails;
      }
      return [];
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = EmailService;
