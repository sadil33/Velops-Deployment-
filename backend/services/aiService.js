const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 2.0 Flash Exp (as established it was the only one working for your key)
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// ===============================================      =============================
// 👇👇👇 USER PROMPT AREA - MODIFY THIS SECTION 👇👇👇
// ============================================================================
const generatePrompt = (context) => `
  You are a security expert. Analyze the following ${context} which contains a table or list of Security Roles (also referred to as "Roles", "User Roles", "Security Role", etc.).
  
  Task: Extract the distinct security role names (e.g., "IDM-Administrator", "RPA-USER", "MingleIONEnabled", "Accounts Payable User").
  
  Rules:
  1. Look for columns or lists labeled "Role", "Security Role", "Role Name".
  2. Return raw JSON array of strings ONLY. No markdown formatting (no \`\`\`json).
  3. Ignore descriptions, "Yes/No" status columns, and headers.
  4. If no specific roles are found, return an empty array [].
`;
// ============================================================================
// 👆👆👆 END OF USER PROMPT AREA 👆👆👆
// ============================================================================

const cleanResponse = (text) => {
    console.log("Gemini Raw Response:", text);
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(cleanJson);
    } catch (e) {
        console.error("JSON Parse Error on AI response:", e);
        return [];
    }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const generateWithRetry = async (model, prompt, parts = [], retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const input = parts.length > 0 ? [prompt, ...parts] : prompt;
            const result = await model.generateContent(input);
            return result;
        } catch (error) {
            console.error(`AI Attempt ${i + 1} failed:`, error.message);

            if (error.status === 429 || error.message.includes('429')) {
                // Increase wait time for strict 2.0-flash-exp limits
                const waitTime = 10000 * (i + 1); // 10s, 20s, 30s
                console.warn(`Rate limit hit. Waiting ${waitTime / 1000}s before retry...`);
                await delay(waitTime);
            } else {
                throw error; // Throw other errors immediately
            }
        }
    }
    throw new Error('Max retries exceeded for AI generation.');
};

const extractRolesWithAI = async (text) => {
    try {
        console.log("AI Input Text Length:", text.length);

        try {
            const prompt = generatePrompt("document text") + `\nDocument Text:\n${text.substring(0, 30000)}`;

            console.log("--- START AI INPUT CONTEXT ---");
            console.log(prompt);
            console.log("--- END AI INPUT CONTEXT ---");

            const result = await generateWithRetry(model, prompt);
            const responseText = result.response.text();

            return cleanResponse(responseText);
        } catch (aiError) {
            console.error("Gemini Generation Failed:", aiError.message);
            // Return empty array (No regex fallback as requested)
            return [];
        }
    } catch (error) {
        console.error("Critical Error in Role Extraction:", error);
        return [];
    }
};

const extractRolesFromImage = async (fileBuffer, mimeType) => {
    try {
        const imagePart = {
            inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType
            },
        };

        const imagePrompt = generatePrompt("image");
        console.log("--- START AI IMAGE PROMPT ---");
        console.log(imagePrompt);
        console.log(`[Image Data: ${fileBuffer.length} bytes, ${mimeType}]`);
        console.log("--- END AI IMAGE PROMPT ---");

        const result = await generateWithRetry(model, imagePrompt, [imagePart]);
        return cleanResponse(result.response.text());
    } catch (error) {
        console.error("AI Image Extraction Error:", error);
        throw new Error("Failed to process image with AI. " + error.message);
    }
};

const extractRolesFromPDF = async (fileBuffer) => {
    try {
        console.log("Using Gemini Native PDF Processing...");
        const pdfPart = {
            inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType: "application/pdf"
            },
        };

        const prompt = generatePrompt("document");
        console.log("--- START AI PDF PROMPT ---");
        console.log(prompt);
        console.log(`[PDF Data: ${fileBuffer.length} bytes]`);
        console.log("--- END AI PDF PROMPT ---");

        const result = await generateWithRetry(model, prompt, [pdfPart]);
        const responseText = result.response.text();
        console.log("AI Raw Response:", responseText);

        return cleanResponse(responseText);
    } catch (error) {
        console.error("AI PDF Extraction Error:", error);
        throw new Error("Failed to process PDF with AI. " + error.message);
    }
};

module.exports = { extractRolesWithAI, extractRolesFromImage, extractRolesFromPDF };
