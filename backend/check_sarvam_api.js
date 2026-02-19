import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const SARVAM_URL = 'https://api.sarvam.ai/v1/chat/completions';
const SARVAM_MODEL = 'sarvam-m';
const apiKey = process.env.SARVAM_API_KEY;

console.log('Checking Sarvam API Key...');

if (!apiKey) {
    console.error('Error: SARVAM_API_KEY is not set in .env file.');
    process.exit(1);
}

// Log a masked version of the key to verify it's loaded
// Note: handle short keys gracefully
const maskedKey = apiKey.length > 8
    ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
    : '***';
console.log(`Key loaded: ${maskedKey}`);

async function testSarvam() {
    try {
        console.log(`Testing chat completion with ${SARVAM_MODEL}...`);
        const response = await fetch(SARVAM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: SARVAM_MODEL,
                messages: [{ role: 'user', content: "Say 'Hello, World!' if you can hear me." }],
                temperature: 0.1,
                max_tokens: 50
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: ${response.status} ${response.statusText}`);
            console.error(`Details: ${errorText}`);
        } else {
            const data = await response.json();
            // Parse OpenAI-style response
            const text = data?.choices?.[0]?.message?.content;

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

testSarvam();
