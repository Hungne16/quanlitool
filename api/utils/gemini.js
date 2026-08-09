import { GoogleGenAI } from '@google/genai';

/**
 * Extracts and prepares all available API keys from environment and client.
 * @param {string} clientApiKey - Optional API key provided by the client
 * @returns {string[]} Array of API keys
 */
export function getAvailableApiKeys(clientApiKey) {
  // Support multiple keys separated by comma in GEMINI_API_KEYS
  const envKeysRaw = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  
  // Split by comma, trim whitespace, and remove empty strings
  const serverKeys = envKeysRaw
    .split(',')
    .map(key => key.trim())
    .filter(key => key.length > 0);
    
  // Prioritize client API key if provided, followed by server keys
  const allKeys = clientApiKey ? [clientApiKey, ...serverKeys] : serverKeys;
  
  // Remove duplicates just in case
  return [...new Set(allKeys)];
}

/**
 * Executes a Gemini prompt with automatic API key rotation on Quota Exceeded (429) errors.
 * @param {string} prompt - The prompt to send to Gemini
 * @param {string} clientApiKey - Optional client-provided API key
 * @param {string} model - The model to use (default: gemini-3.6-flash)
 * @returns {Promise<string>} The output text from Gemini
 */
export async function executeWithKeyRotation(prompt, clientApiKey = null, model = "gemini-3.6-flash") {
  const keysToTry = getAvailableApiKeys(clientApiKey);
  
  if (keysToTry.length === 0) {
    throw new Error('GEMINI_API_KEY is not configured on server and not provided by client');
  }

  let lastError = null;

  // Loop through available keys
  for (let i = 0; i < keysToTry.length; i++) {
    const currentKey = keysToTry[i];
    
    try {
      if (keysToTry.length > 1) {
         console.log(`[gemini] Trying API Key ${i + 1}/${keysToTry.length}...`);
      }
      
      const aiClient = new GoogleGenAI({ apiKey: currentKey });
      
      const interaction = await aiClient.interactions.create({
        model: model,
        input: prompt
      });
      
      if (i > 0) {
        console.log(`[gemini] Successfully generated response using fallback Key ${i + 1}!`);
      }
      
      return interaction.output_text;
      
    } catch (error) {
      lastError = error;
      const errorMessage = error.message || '';
      
      // Check if it's a Quota / Rate Limit error
      const isRateLimit = errorMessage.includes('429') || 
                          errorMessage.includes('Quota exceeded') || 
                          errorMessage.includes('rate-limit') ||
                          errorMessage.includes('Resource has been exhausted');
                          
      if (isRateLimit) {
        console.warn(`[gemini] Key ${i + 1} exhausted quota or rate limited. Error: ${errorMessage}`);
        // If there are more keys to try, continue the loop
        if (i < keysToTry.length - 1) {
          console.warn(`[gemini] Switching to next API Key...`);
          continue; 
        } else {
          console.error(`[gemini] All ${keysToTry.length} API keys have exhausted their quota!`);
        }
      } else {
        // If it's a 400 Bad Request (Invalid API Key)
        if (errorMessage.includes('400') && errorMessage.toLowerCase().includes('api key not valid')) {
            console.warn(`[gemini] Key ${i + 1} is invalid. Error: ${errorMessage}`);
            if (i < keysToTry.length - 1) {
                console.warn(`[gemini] Switching to next API Key...`);
                continue;
            }
        }
        
        // If it's an unexpected error, don't rotate, just throw (maybe prompt is too large, etc.)
        console.error(`[gemini] Unexpected error with Key ${i + 1}: ${errorMessage}`);
        throw error;
      }
    }
  }

  // If we reach here, all keys failed with rate limits or invalid key errors
  throw lastError;
}
