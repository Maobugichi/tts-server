import type { Request, Response } from 'express';
import generateSpeech from '../service/generateStreamSpeech.js';

export const streamSpeechController = async (req: Request, res: Response) => {
  try {
    const { voiceId, text, outputFormat = 'mp3_44100_128' } = req.body;

    // --- Validation (Same as before) ---
    if (!voiceId || !text) {
      return res.status(400).json({ error: 'Missing voiceId or text' });
    }
    
    // Validate format (PCM formats need careful handling in browser)
    const validFormats = [
      'mp3_44100_128', 'mp3_44100_192', 'mp3_22050_32',
      'pcm_16000', 'pcm_22050', 'pcm_24000', 'pcm_44100', 'ulaw_8000'
    ];
    if (!validFormats.includes(outputFormat)) {
      return res.status(400).json({ error: 'Invalid output format' });
    }
    // -----------------------------------

    console.log(`Starting WS stream for voice: ${voiceId}`);

    // Call the WS service
    const audioStream = await generateSpeech(voiceId, outputFormat, text);

    // Set headers for streaming response
    const contentType = outputFormat.startsWith('mp3') 
      ? 'audio/mpeg' 
      : 'audio/wav'; // Note: Raw PCM will likely need a WAV container to play in browser

    res.setHeader('Content-Type', contentType);
    res.setHeader('Transfer-Encoding', 'chunked');

    // Pipe the audio stream directly to the response
    audioStream.pipe(res);

    // Handle stream errors to prevent server crash
    audioStream.on('error', (err) => {
      console.error('Stream processing error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Streaming failed' });
      }
      res.end();
    });

  } catch (error: any) {
    console.error('Controller Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};