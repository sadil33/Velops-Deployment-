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
            console.error(`[Gemini] Model ${modelName} failed. Error details:`, error);
            if (error.response) {
                console.error(`[Gemini] Model ${modelName} response error details:`, JSON.stringify(error.response, null, 2));
            }

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

const Bytez = require("bytez.js");

const chatWithDocument = async (question, token, tenantUrl) => {
    if (!documentContext) {
        throw new Error("No document context found. Please upload a file in Prerequisites first.");
    }

    const key = "b131c3d8be1f824396072eac5feb3783";
    const sdk = new Bytez(key);
    const model = sdk.model("openai/gpt-4o-mini");

    const systemPrompt = `You are a High-Level Data Extraction Engineer.

Primary Objective
Analyze only the provided extracted data and respond to customer questions strictly based on that data.
Your responsibility is to describe, summarize, and explain the extracted information with absolute precision and zero assumptions.

Core Rules (MANDATORY)

1. Data-Bound Responses Only
- Use only the information explicitly present in the extracted data.
- Provide unique data only once (avoid repetition).
- Do NOT infer, assume, guess, or hallucinate any information.
- If something is not present in the data, state exactly:

  “This information is not available in the extracted data.”

2. Component Identification
When asked questions such as:
- “What components are used in this?”
- “Which modules, services, tools, or technologies are involved?”

You must:
- List only the components explicitly mentioned in the extracted data.
- Do not generalize.
- Do not add industry-standard components unless explicitly stated.

3. Strict Terminology Preservation
- Preserve exact naming, casing, symbols, and formatting exactly as found in the extracted data.
- Do not rename, normalize, reformat, or rephrase component names unless explicitly asked.

4. No External Knowledge
- Do not use background knowledge, best practices, or domain expertise beyond the provided data.
- Do not reference documentation, standards, or common implementations unless included in the extracted data.

5. Clear Handling of Missing or Unrelated Questions

A. Not Present in the Extracted Data
- First state exactly:
  “This information is not available in the extracted data.”
- Then provide a strict summary of the available extracted data only.
- Do not introduce any new information.
- Do not speculate.
- Do not expand beyond the extracted content.

B. Completely Unrelated to the Extracted Data
- First state exactly:
  “This information is not available in the extracted data.”
- Then provide a concise summary of the extracted data to maintain response relevance.
- Do not answer the unrelated question directly.

6. Greeting and Conversation Starter Behavior (NEW FEATURE)
If the user message is a greeting or small-talk (examples: “Hi”, “Hello”, “Hey”, “Good morning”, “Good evening”, “How are you?”):
- Respond politely.
- Confirm you can help with the available documents/extracted data.
- Ask how you can help with those documents.
- Generate 3–6 example questions that are strictly based on what is explicitly present in the extracted data.
- Do NOT invent document names, topics, or fields not present in the extracted data.
- If no extracted data has been provided yet, say:
  “This information is not available in the extracted data.”
  Then ask the user to share the extracted data and provide 3–6 generic, non-assumptive question templates that do not introduce new facts, such as:
  - “What does the extracted data say about [X]?”
  - “Which components are listed in the extracted data?”
  - “Summarize the key points present in the extracted data.”
  - “What dates, IDs, or names appear in the extracted data?”
  - “What actions or steps are mentioned in the extracted data?”

Response Format (STRICT)
- Use clear bullet points or numbered lists.
- Be concise, factual, and structured.
- No storytelling.
- No assumptions.
- No external enrichment.
- No explanations beyond what the extracted data supports.`;

    const combinedContent = `EXTRACTED DATA: ${documentContext}\n\nSYSTEM PROMPT: ${systemPrompt}\n\nUSER QUESTION: ${question}`;

    try {
        console.log(`[Bytez SDK] Running model: openai/gpt-4o-mini`);

        const { error, output } = await model.run([
            {
                "role": "user",
                "content": combinedContent
            }
        ]);

        if (error) {
            console.error("[Bytez SDK Error]", error);
            throw new Error(`Bytez SDK error: ${JSON.stringify(error)}`);
        }

        console.log('[Bytez SDK] Success');

        console.log('[Bytez SDK] Raw output:', JSON.stringify(output, null, 2));

        let finalAnswer = "";

        // Strategy 1: Check if output is the message object itself {role, content}
        if (output && typeof output === 'object' && output.content) {
            finalAnswer = output.content;
        }
        // Strategy 2: Check if output is an array of message objects [{role, content}]
        else if (Array.isArray(output) && output[0]?.content) {
            finalAnswer = output[0].content;
        }
        // Strategy 3: Check for OpenAI-like structure output.choices[0].message.content
        else if (output?.choices?.[0]?.message?.content) {
            finalAnswer = output.choices[0].message.content;
        }
        // Strategy 4: Fallback to text properties
        else if (output?.text || output?.output) {
            finalAnswer = output.text || output.output;
        }
        // Strategy 5: If it's already a string, use it
        else if (typeof output === 'string') {
            finalAnswer = output;
        }
        // Strategy 6: Catch-all for objects
        else {
            finalAnswer = JSON.stringify(output);
        }

        console.log('[Bytez SDK] Extracted content:', finalAnswer);
        return finalAnswer;

    } catch (error) {
        console.error("[Bytez SDK Exception]", error.message);
        throw new Error(`Bytez SDK failed: ${error.message}`);
    }
};

module.exports = { extractDataWithGemini, setDocumentContext, chatWithDocument };
