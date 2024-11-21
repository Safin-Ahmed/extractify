const axios = require("axios");
const cheerio = require("cheerio");

/**
 * This Function is responsible for scraping given array of websites to get emails
 * @param {{type: string, url: string}[]} websites
 * @returns String[]
 */
async function scrapeWebsitesToGetEmails(websites) {
  let finalEmails = [];

  // Iterating websites to get the html content of each website
  for (let website of websites) {
    try {
      const { data: html } = await axios.get(website?.url);
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = html.match(emailPattern);

      finalEmails = [...finalEmails, ...new Set(emails)];
    } catch (error) {
      console.error("Error scraping website: ", error);
      return [];
    }
  }

  return finalEmails;
}

/**
 *
 * @param {String} query
 * @returns String[]
 */
async function searchGoogle(query) {
  const searchURL = `https://www.google.com/search?q=${encodeURIComponent(
    query
  )}`;

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    DNT: "1",
  };

  try {
    const { data: html } = await axios.get(searchURL, {
      headers,
    });

    if (html.includes("detected unusual traffic")) {
      console.error("CAPTCHA detected! Retrying...");
      return;
    }

    const $ = cheerio.load(html);
    const bodyText = $("body").text();
    let domain = null;
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = bodyText.match(emailPattern);

    return emails;
  } catch (error) {
    console.error("Error searching Google: ", error);
    return [];
  }
}

/**
 * This Function is responsible to get the company domain
 * @param {String} query
 * @returns String
 */

async function getCompanyDomain(query, companyName) {
  const searchURL = `https://www.google.com/search?q=${encodeURIComponent(
    query
  )}`;

  let domain = null;

  // normalizing company name to domain specific
  const normalizedCompanyName = companyName.toLowerCase().replace(/\s+/g, "");

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    DNT: "1",
  };

  try {
    const { data: html } = await axios.get(searchURL, {
      headers,
    });
    const $ = cheerio.load(html);

    // Extract all links from search results
    const links = [];
    $("a").each((_, element) => {
      const href = $(element).attr("href");
      if (href && href.startsWith("/url?q=")) {
        const url = href.split("/url?q=")[1].split("&")[0];
        links.push(url);
      }
    });

    const matchingURLS = links.filter((link) =>
      link.includes(`${normalizedCompanyName}.com`)
    );

    if (matchingURLS && matchingURLS.length > 0) {
      domain = new URL(matchingURLS[0]).host;
    }

    return domain;
  } catch (error) {
    console.error("Error searching Company Website: ", error);
    return null;
  }
}
module.exports = {
  scrapeWebsitesToGetEmails,
  searchGoogle,
  getCompanyDomain,
};
