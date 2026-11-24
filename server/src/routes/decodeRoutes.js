import express from 'express';
import {
  decodeText,
  decodeCode,
  decodeCipher,
  decodeQR,
  decodeImage,
  optimizePrompt
} from '../controllers/decodeController.js';
import { uploadImage } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/text', decodeText);
router.post('/code', decodeCode);
router.post('/cipher', decodeCipher);
router.post('/qr', decodeQR);
router.post('/image', uploadImage.single('image'), decodeImage);
router.post('/prompt', optimizePrompt);

export default router;
