const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API KEY found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log("Fetching available models...");
        // For GoogleGenerativeAI SDK, we might not have a direct listModels method on the main class slightly depending on version,
        // but let's try to infer or use the model manager if exposed, or just rely on documentation knowledge if this fails.
        // Actually the SDK doesn't expose listModels directly on the main client in all versions. 
        // Let's try to access the model through a known endpoint or use the generic request if possible.
        // Wait, standard nodejs SDK usually doesn't have a simple listModels helper.
        // I will try to use a REST call using fetch/axios for this specific debugging task to be sure.

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.log("No models found or error structure:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
