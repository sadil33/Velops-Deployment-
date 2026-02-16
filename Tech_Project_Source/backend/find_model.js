const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-002",
    "gemini-1.5-pro",
    "gemini-1.5-pro-001",
    "gemini-1.5-pro-002",
    "gemini-1.0-pro",
    "gemini-pro"
];

async function findWorkingModel() {
    console.log("🔍 Testing for a working standard model...");

    for (const modelName of modelsToTest) {
        process.stdout.write(`Testing ${modelName}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            const response = result.response.text();
            console.log(`✅ SUCCESS!`);
            console.log(`>>> WINNER: ${modelName}`);
            return; // Stop at the first winner
        } catch (error) {
            if (error.status === 429) {
                console.log(`⚠️ Rate Limited (Exists, but busy).`);
            } else if (error.status === 404) {
                console.log(`❌ Not Found.`);
            } else {
                console.log(`❌ Failed: ${error.status || error.message}`);
            }
        }
    }
    console.log("😞 No standard models worked. You might be restricted to Experimental models.");
}

findWorkingModel();
