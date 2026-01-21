import WebSocket from 'ws';
import { PassThrough } from 'stream';
import { getElevenLabsApiKey } from '../config/env.js';

const API_KEY = getElevenLabsApiKey();

// Define types based on ElevenLabs WS API
interface VoiceSettings {
  stability: number;
  similarity_boost: number;
}

interface InitializationMessage {
  text: string;
  voice_settings?: VoiceSettings;
  xi_api_key: string;
  generation_config?: {
    chunk_length_schedule: number[];
  };
}

interface StreamMessage {
  text: string;
  try_trigger_generation?: boolean;
}

interface AudioResponse {
  audio: string; // Base64 encoded
  isFinal: boolean;
  normalizedAlignment?: {
    char_start_times_ms: number[];
    chars_durations_ms: number[];
    chars: string[];
  };
}

export const generateSpeech = (
  voiceId: string,
  outputFormat: string,
  text: string
): Promise<PassThrough> => {
  return new Promise((resolve, reject) => {
    // 1. Create the Output Stream (PassThrough)
    // We will push audio data into this stream as it arrives
    const audioStream = new PassThrough();

    // 2. Construct WebSocket URL with Query Parameters
    // Note: output_format is passed as a query param here
    const modelId = 'eleven_multilingual_v2';
    const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${modelId}&output_format=${outputFormat}`;

    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log('Connected to ElevenLabs WebSocket');

      // 3. Send Initialization Message (BOS)
      // We send a space " " with config and auth to start the connection
      const initMessage: InitializationMessage = {
        text: " ", 
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
        },
        xi_api_key: API_KEY, // API Key goes here for WS
      };
      ws.send(JSON.stringify(initMessage));

      // 4. Send the Actual Text
      // You can split this into multiple messages if you were streaming text input,
      // but here we send the full text payload.
      const textMessage: StreamMessage = {
        text: text,
        try_trigger_generation: true,
      };
      ws.send(JSON.stringify(textMessage));

      // 5. Send End of Stream (EOS)
      // An empty string tells ElevenLabs we are done sending text.
      const eosMessage = { text: "" };
      ws.send(JSON.stringify(eosMessage));
    });

    ws.on('message', (data: Buffer) => {
      try {
        const response = JSON.parse(data.toString()) as AudioResponse;

        if (response.audio) {
          // Decode Base64 chunk to binary and push to stream
          const chunk = Buffer.from(response.audio, 'base64');
          audioStream.write(chunk);
        }

        if (response.isFinal) {
          // ElevenLabs says the audio is done
          // We don't close the stream yet, waiting for 'close' event from WS
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    ws.on('close', (code, reason) => {
      console.log(`ElevenLabs WS closed: ${code} ${reason}`);
      audioStream.end(); // Close the output stream
    });

    ws.on('error', (error) => {
      console.error('ElevenLabs WS error:', error);
      audioStream.destroy(error);
      reject(error); // Reject promise if connection fails immediately
    });

    // Resolve the promise with the stream immediately so the controller can pipe it
    resolve(audioStream);
  });
};

export default generateSpeech;