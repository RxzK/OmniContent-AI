const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateContent(title, category) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
        You are an expert content creator and affiliate marketer. 
        Create a highly engaging social media post and a short blog snippet based on the following news title.
        The content should be optimized for the ${category} niche and should sound professional yet exciting.
        If possible, suggest a type of affiliate product that would fit well with this content.

        News Title: "${title}"

        Format the output as JSON with the following fields:
        - socialMediaPost: string
        - blogSnippet: string
        - suggestedAffiliateProduct: string
        - clickbaitTitle: string
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Basic cleanup of potential Markdown code blocks in response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Failed to parse AI response as JSON");
    } catch (error) {
        console.error("AI Generation Error:", error.message);
        return {
            socialMediaPost: "Error generating post.",
            blogSnippet: "Error generating snippet.",
            suggestedAffiliateProduct: "General Tech",
            clickbaitTitle: title
        };
    }
}

module.exports = { generateContent };
