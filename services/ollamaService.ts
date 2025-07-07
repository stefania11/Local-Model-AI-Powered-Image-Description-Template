import { ImageInfo } from '../types';

// The URL of the Ollama API endpoint.
const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
// The name of the model to use for generating descriptions.
// llava is a great open-source model for this task.
// Users must have it installed via `ollama pull llava`
const OLLAMA_MODEL = 'llava'; 

// Interface for the response from the Ollama API.
interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
}

// Generates a description for an image using the Ollama API.
export async function generateDescriptionFromImage(imageInfo: ImageInfo): Promise<string> {
  // The prompt to use for generating the description.
  const prompt = "Describe this image in detail. What objects are present? What is the setting? What actions are taking place? What is the overall mood or feeling of the image?";

  try {
    // Send a POST request to the Ollama API.
    const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: prompt,
            images: [imageInfo.base64Data], // Ollama API expects an array of base64 strings
            stream: false,
        }),
    });

    // If the response is not ok, throw an error.
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Could not parse error response.' }));
        throw new Error(`Ollama API request failed with status ${response.status}. Message: ${errorBody.error}. Make sure Ollama is running and the '${OLLAMA_MODEL}' model is installed.`);
    }

    // Parse the response from the Ollama API.
    const data: OllamaResponse = await response.json();
    
    // If the response contains a description, return it.
    if (data.response) {
        return data.response.trim();
    } else {
        throw new Error("The Ollama API returned an empty description.");
    }
  } catch (error) {
    // Log the error to the console.
    console.error("Error calling Ollama API:", error);
    // If the error is a TypeError, it's likely a network error.
    if (error instanceof TypeError) { // This often indicates a network error, e.g., refused connection or CORS
        throw new Error(`Could not connect to the Ollama server. \n1. Is it running? \n2. Are you getting a CORS error? If so, you must restart the Ollama server with permissions for web apps. Try running this command in your terminal: \n OLLAMA_ORIGINS='*' ollama serve`);
    }
    // If the error is an instance of Error, re-throw it.
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    // Otherwise, throw a generic error.
    throw new Error("An unexpected error occurred while communicating with the Ollama API.");
  }
}