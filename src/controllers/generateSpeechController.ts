import type { Request, Response } from 'express';
import generateSpeech from '../service/generateSpeechService.js';

export const textToSpeechController = async (req: Request, res: Response) => {
  try {
    const { voiceId, text, outputFormat = 'mp3_44100_128' } = req.body;

    
    if (!voiceId) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'voiceId is required'
      });
    }

    if (!text) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'text is required'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Text must be less than 5000 characters'
      });
    }

   
    const validFormats = [
      'mp3_44100_128',
      'mp3_44100_192',
      'mp3_22050_32',
      'pcm_16000',
      'pcm_22050',
      'pcm_24000',
      'pcm_44100',
      'ulaw_8000'
    ];

    if (!validFormats.includes(outputFormat)) {
      return res.status(400).json({
        error: 'Validation error',
        message: `Invalid output format. Valid formats: ${validFormats.join(', ')}`
      });
    }

  
    const audioStream = await generateSpeech(voiceId, outputFormat, text);

   
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    const contentType = outputFormat.startsWith('mp3') 
      ? 'audio/mpeg' 
      : outputFormat.startsWith('pcm') || outputFormat.startsWith('wav')
      ? 'audio/wav'
      : 'audio/basic';

  
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', audioBuffer.length.toString());
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');
    

    res.send(audioBuffer);

  } catch (error: any) {
    console.error('Text-to-speech error:', error);

    
    if (error.statusCode === 401) {
      return res.status(401).json({
        error: 'Authentication error',
        message: 'Invalid API key or missing permissions'
      });
    }

    if (error.statusCode === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      });
    }

    if (error.statusCode === 400) {
      return res.status(400).json({
        error: 'Bad request',
        message: error.body?.detail?.message || 'Invalid request parameters'
      });
    }

   
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to generate speech'
    });
  }
};