const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
// Validates API Key availability
const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY not found in environment variables.");
        return null;
    }
    return new GoogleGenerativeAI(apiKey);
};

const extractDataWithGemini = async (documentText) => {
    const genAI = getGenAI();
    if (!genAI) {
        throw new Error("Gemini API Key is missing. Please configure GEMINI_API_KEY.");
    }

    // Using the user-provided prompt template
    const prompt = `
    You are a data extraction engine. Your job is to read the provided text and extract a specific list of items.

    TARGET DATA TO EXTRACT: Security roles

    RULES:
    1. Analyze the document text provided below.
    2. Identify all items that match the "TARGET DATA" description.
    3. If the data is in a table, extract the relevant column values.
    4. Clean the data (remove footnote markers, extra whitespace).
    5. Return the output as a valid JSON object with a single key "extracted_items".
    6. Do not include Markdown formatting (like \`\`\`json). Just the raw JSON string.

    DOCUMENT TEXT:
    ${documentText}
    `;

    const modelsToTry = [
        "gemini-3-flash-preview",
        "gemini-2.0-flash",
        "gemini-flash-latest"
    ];

    for (const modelName of modelsToTry) {
        try {
            console.log(`[Gemini] Attempting with model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log(`[Gemini] Success with ${modelName}. Raw response:`, text);

            // Sanitize response to ensure it's valid JSON
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

            const parsed = JSON.parse(cleanJson);
            return parsed.extracted_items || [];
        } catch (error) {
            console.warn(`[Gemini] Model ${modelName} failed:`, error.message);

            // If this was the last model, throw the error
            if (modelName === modelsToTry[modelsToTry.length - 1]) {
                console.error("[Gemini] All fallback models failed.");
                throw new Error(`Failed to extract data using Gemini AI (tried ${modelsToTry.join(', ')}): ` + error.message);
            }
            // Otherwise loop continues to next model
        }
    }
};

module.exports = { extractDataWithGemini };
