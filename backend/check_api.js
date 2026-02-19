import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const apiKey = process.env.GEMINI_API_KEY;

console.log('Checking Gemini API Key...');

if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not set in .env file.');
    process.exit(1);
}

// Log a masked version of the key to verify it's loaded
console.log(`Key loaded: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

async function testGemini() {
    try {
        console.log('Listing available models...');
        const listModelsResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);

        if (!listModelsResponse.ok) {
            const errorText = await listModelsResponse.text();
            console.error(`List Models Error: ${listModelsResponse.status} ${listModelsResponse.statusText}`);
            console.error(errorText);
        } else {
            const models = await listModelsResponse.json();
            console.log('Available models:', models.models?.map(m => m.name).join(', '));
        }

        console.log('\nTesting generateContent with gemini-2.5-flash-lite...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Say 'Hello, World!' if you can hear me." }] }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: ${response.status} ${response.statusText}`);
            console.error(`Details: ${errorText}`);
        } else {
            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                console.log('Success! API responded with:');
                console.log(text);
            } else {
                console.log('API responded, but no text found in response.');
                console.log(JSON.stringify(data, null, 2));
            }
        }

    } catch (error) {
        console.error('Network or Execution Error:', error);
        process.exit(1);
    }
}

testGemini();
