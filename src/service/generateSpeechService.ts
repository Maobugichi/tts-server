import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { getElevenLabsApiKey } from "../config/env.js";

const API_KEY = getElevenLabsApiKey();


type OutputFormat = 
  | "mp3_44100_128" 
  | "mp3_44100_192" 
  | "mp3_22050_32"
  | "pcm_16000" 
  | "pcm_22050" 
  | "pcm_24000" 
  | "pcm_44100"
  | "ulaw_8000";

const generateSpeech = async (
  voiceId: string, 
  outputFormat: OutputFormat, 
  text: string
) => {
    const client = new ElevenLabsClient({
        apiKey: API_KEY
    });

    const result = await client.textToSpeech.convert(voiceId, {
        outputFormat: outputFormat,
        text: text,
        modelId: "eleven_multilingual_v2",
    });
    
    return result;
}

export default generateSpeech;