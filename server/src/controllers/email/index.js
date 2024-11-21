const EmailService = require("../../services/email");
const validator = require("validator");
const OpenAIWrapper = require("../../utils/openai");

class EmailController {
  constructor() {
    this.emailService = new EmailService();
    this.openaiWrapper = new OpenAIWrapper();
  }

  findEmail = async (req, res) => {
    const { name, company, websites, companyDomain } = req.body;

    if (!name || !company) {
      return res
        .status(400)
        .json({ success: false, message: "Name and company are required" });
    }

    try {
      const emails = await this.emailService.findEmail({
        name,
        company,
        websites,
        companyDomain,
      });

      if (emails && emails.length > 0) {
        return res.status(200).json({
          success: true,
          emails: [...new Set(emails)],
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "No Email Address Found",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

  submitEmail = async (req, res) => {
    const { email } = req.body;

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing email address",
      });
    }

    try {
      const generatedMessage = await this.openaiWrapper.generateMessage(email);

      res.status(200).json({
        success: true,
        message: generatedMessage.choices[0]?.message?.content,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          "Something went wrong generating the message. Please Try Again!",
      });
    }
  };
}

module.exports = EmailController;
