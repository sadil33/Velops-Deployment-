const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios"); // Import Axios for Coleman API

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
    You are a strict data extraction engine. Your SOLE job is to extract Security Roles from the provided text.

    TARGET DATA: Security Roles (typically technical identifiers like 'IG_Role_Name', 'RPA_Admin', 'FND_WebUser', etc.)

    STRICT RULES:
    1. Extract ONLY items that are clearly identified as Security Roles.
    2. IGNORE all other text, headers, descriptions, page numbers, footnotes, or unrelated data.
    3. If a value looks like a sentence, a description, or a person's name, DO NOT include it.
    4. Return the output as a valid JSON object with a single key "extracted_items" which is an array of strings.
    5. Do not include Markdown formatting (like \`\`\`json). Just the raw JSON string.

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

// --- New Chat Functionality ---
let documentContext = ""; // In-memory storage for the last parsed document

const setDocumentContext = (text) => {
    console.log(`[Gemini] Context updated. Length: ${text.length} chars.`);
    documentContext = text;
};

const chatWithDocument = async (question, token, tenantUrl) => {
    if (!documentContext) {
        throw new Error("No document context found. Please upload a file in Prerequisites first.");
    }

    if (!token || !tenantUrl) {
        throw new Error("Missing authentication details (token or tenantUrl).");
    }

    // Truncate context if strictly necessary, but Claude has a large context window.
    // Keeping it safe at ~150k chars.
    const MAX_CHARS = 150000;
    const truncatedContext = documentContext.length > MAX_CHARS
        ? documentContext.substring(0, MAX_CHARS) + "...[TRUNCATED]"
        : documentContext;

    const systemPrompt = `Role
You are a High-Level Data Extraction Engineer.

Primary Objective
Analyze only the provided extracted data and respond to customer questions strictly based on that data.
Your responsibility is to describe, summarize, and explain the extracted information with absolute precision and zero assumptions.

Core Rules (MANDATORY)

Data-Bound Responses Only
Use only the information explicitly present in the extracted data.
Do NOT infer, assume, guess, or hallucinate any information.
If something is not present in the data, state:
“This information is not available in the extracted data.”

Component Identification
When asked questions such as:
“What components are used in this?”
“Which modules, services, tools, or technologies are involved?”
List only the components explicitly mentioned in the extracted data.
Do not generalize or add industry-standard components unless they are explicitly stated.

Strict Terminology Preservation
Preserve exact naming, casing, symbols, and formatting as found in the extracted data.
Do not rename, normalize, or rephrase component names unless explicitly asked.

No External Knowledge
Do not use background knowledge, best practices, or domain expertise beyond the provided data.
Do not reference documentation, standards, or common implementations unless included in the extracted data.

Clear Handling of Missing Data
If a customer asks about something not found in the extracted data:
Clearly state it is not mentioned.
Do not speculate or suggest alternatives.

Response Format (STRICT)
Use clear bullet points or numbered lists.
Be concise, factual, and structured.
No storytelling, no explanations beyond what the data supports.`;

    // Construct the final combined prompt
    const finalPrompt = `${systemPrompt}\n\nEXTRACTED DATA:\n${truncatedContext}\n\nUSER QUESTION:\n${question}`;

    try {
        const cleanTenantUrl = tenantUrl.replace(/\/$/, '');
        const colemanUrl = `${cleanTenantUrl}/GENAI/chatsvc/api/v1/prompt`;

        console.log(`[Coleman AI] Sending request to: ${colemanUrl}`);

        const response = await axios.post(colemanUrl, {
            config: {
                temperature: 0.1
            },
            prompt: finalPrompt,
            model: "CLAUDE",
            version: "claude-3-5-sonnet-20241022-v2:0"
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'x-infor-logicalidprefix': 'lid://infor.colemanddp',
                'Content-Type': 'application/json'
            }
        });

        // Assuming the response structure based on standard Coleman/AI APIs. 
        // If it returns just text, we might need to adjust. 
        // Usually it's response.data or response.data.text depending on the endpoint.
        console.log('[Coleman AI] Response status:', response.status);

        // Check for 'answer' field (Coleman pattern)
        if (response.data.answer) return response.data.answer;

        // Adjust this extraction based on actual API response structure
        // If the API returns the raw text directly in a field:
        if (typeof response.data === 'string') return response.data;
        if (response.data.text) return response.data.text;
        if (response.data.content) return response.data.content;

        // Check for OpenAI-like structure (choices[0].message.content)
        if (response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
            return response.data.choices[0].message.content;
        }

        // Fallback: return stringified data if structure is unknown
        return typeof response.data === 'object' ? JSON.stringify(response.data) : response.data;

    } catch (error) {
        console.error("[Coleman AI Chat Error]", error.message);
        if (error.response) {
            console.error("[Coleman AI Error Details]", error.response.data);
            throw new Error(`Coleman AI failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        }
        throw new Error(`Coleman AI failed: ${error.message}`);
    }
};

module.exports = { extractDataWithGemini, setDocumentContext, chatWithDocument };
