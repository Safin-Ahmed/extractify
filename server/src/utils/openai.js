const OpenAI = require("openai");

class OpenAIWrapper {
  constructor() {
    const openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openaiWrapper = openaiClient;
  }

  generateMessage = async (email) => {
    const prompt = `
    Write a professional LinkedIn connection request message for the person with the email ${email}.
    The tone should be friendly and professional. Include a reason for connecting, such as learning about their work, potential collaboration, or shared interests.
  `;

    try {
      const result = await this.openaiWrapper.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "system", content: prompt }],
      });

      return result;
    } catch (error) {
      console.error("Error in generate message function: ", error);
      throw new Error("Error in openai generate message function: ", error);
    }
  };
}

module.exports = OpenAIWrapper;
