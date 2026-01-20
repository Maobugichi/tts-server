import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { Router } from "express";
import { getVoiceController } from "../controllers/getVoiceController.js";
import { textToSpeechController } from "../controllers/generateSpeechController.js";


//const client = new ElevenLabsClient({apiKey: ELEVEN_API_KEY}) 

const router = Router();

router.get("/voices", getVoiceController);

router.post('/tts', textToSpeechController);
export default router;
