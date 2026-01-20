import type { Request, Response } from "express";
import { getVoices } from "../service/getVoice.js";

export const getVoiceController = async (req: Request, res: Response) => {
  try {
    const voices = await getVoices();
    res.json(voices);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err });
  }
};
