import dotenv from 'dotenv';
dotenv.config();

export function assertEnv() {
 
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }
}


export function getElevenLabsApiKey(): string {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is not set");
  }
  return process.env.ELEVENLABS_API_KEY;
}