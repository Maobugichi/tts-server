import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { getElevenLabsApiKey } from "../config/env.js";

const API_KEY = getElevenLabsApiKey()
 
 export const getVoices = async () => {
  
  const client = new ElevenLabsClient({
        apiKey: API_KEY,
    });
    const result = await client.voices.search({});

    console.log(result)

    return result
}