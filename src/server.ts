
import express from 'express';
import cors from 'cors';
import { assertEnv } from './config/env.js';
import voiceRouter from './routes/tts.js'




assertEnv()

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use("/api", voiceRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 TTS Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (!process.env.ELEVENLABS_API_KEY) {
    console.warn('⚠️  Warning: ELEVENLABS_API_KEY not set in environment variables');
  }
});

export default app;