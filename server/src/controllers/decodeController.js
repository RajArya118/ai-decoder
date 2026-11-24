import { DeterministicService } from '../services/deterministicService.js';
import { AIService } from '../services/aiService.js';
import { getIsMongoConnected } from '../config/db.js';
import { DecodeRecord } from '../models/MongooseModels.js';
import { LocalStore } from '../models/LocalStore.js';

// Helper to save a decode record
async function persistRecord(data) {
  try {
    const isMongo = getIsMongoConnected();
    if (isMongo) {
      return await DecodeRecord.create(data);
    } else {
      return await LocalStore.saveDecode(data);
    }
  } catch (err) {
    console.error('[Persistence Error]', err.message);
    return { ...data, id: 'temp-' + Date.now() };
  }
}

export const decodeText = async (req, res) => {
  const startTime = Date.now();
  try {
    const { input, mode = 'standard', autoDetect = true } = req.body;
    if (!input || !input.trim()) {
      return res.status(400).json({ success: false, message: 'Input text is required' });
    }

    let decodedOutput = input;
    let format = 'Plain Text';

    if (autoDetect) {
      const detected = DeterministicService.autoDetectAndDecode(input);
      if (detected.success && detected.result !== input) {
        decodedOutput = detected.result;
        format = detected.format || detected.detectedType;
      }
    }

    const aiExplanation = await AIService.analyzeText({ input, decoded: decodedOutput, mode });
    const executionTimeMs = Date.now() - startTime;

    const record = await persistRecord({
      userId: req.user?.id || null,
      decoderType: 'text',
      rawInput: input,
      decodedOutput,
      aiExplanation: {
        ...aiExplanation,
        detectedFormat: aiExplanation.detectedFormat || format
      },
      metadata: {
        language: 'text',
        executionTimeMs
      }
    });

    res.json({
      success: true,
      data: record,
      executionTimeMs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const decodeCode = async (req, res) => {
  const startTime = Date.now();
  try {
    const { code, language = 'javascript', mode = 'explain' } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Code snippet is required' });
    }

    const aiExplanation = await AIService.analyzeCode({ code, language, mode });
    const executionTimeMs = Date.now() - startTime;

    const record = await persistRecord({
      userId: req.user?.id || null,
      decoderType: 'code',
      rawInput: code,
      decodedOutput: aiExplanation.summary,
      aiExplanation,
      metadata: {
        language,
        executionTimeMs
      }
    });

    res.json({
      success: true,
      data: record,
      executionTimeMs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const decodeCipher = async (req, res) => {
  const startTime = Date.now();
  try {
    const { input, cipherType = 'base64', action = 'decode' } = req.body;
    if (!input || !input.trim()) {
      return res.status(400).json({ success: false, message: 'Cipher input is required' });
    }

    let resultObj;
    switch (cipherType.toLowerCase()) {
      case 'base64':
        resultObj = action === 'encode' ? DeterministicService.encodeBase64(input) : DeterministicService.decodeBase64(input);
        break;
      case 'url':
        resultObj = action === 'encode' ? DeterministicService.encodeURL(input) : DeterministicService.decodeURL(input);
        break;
      case 'hex':
        resultObj = action === 'encode' ? DeterministicService.encodeHex(input) : DeterministicService.decodeHex(input);
        break;
      case 'binary':
        resultObj = action === 'encode' ? DeterministicService.encodeBinary(input) : DeterministicService.decodeBinary(input);
        break;
      case 'jwt':
        resultObj = DeterministicService.decodeJWT(input);
        break;
      case 'rot13':
        resultObj = DeterministicService.rot13(input);
        break;
      case 'morse':
        resultObj = action === 'encode' ? DeterministicService.encodeMorse(input) : DeterministicService.decodeMorse(input);
        break;
      case 'auto':
      default:
        resultObj = DeterministicService.autoDetectAndDecode(input);
        break;
    }

    if (!resultObj.success) {
      return res.status(400).json({ success: false, message: resultObj.error || 'Decoding failed' });
    }

    const aiExplanation = await AIService.analyzeText({
      input,
      decoded: resultObj.result,
      mode: `Cipher ${cipherType}`
    });

    const executionTimeMs = Date.now() - startTime;
    const record = await persistRecord({
      userId: req.user?.id || null,
      decoderType: cipherType === 'jwt' ? 'jwt' : 'cipher',
      rawInput: input,
      decodedOutput: resultObj.result,
      aiExplanation: {
        ...aiExplanation,
        detectedFormat: resultObj.format || cipherType.toUpperCase()
      },
      metadata: {
        language: cipherType,
        executionTimeMs
      }
    });

    res.json({
      success: true,
      data: record,
      parsedData: resultObj.parsedData || null,
      executionTimeMs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const decodeQR = async (req, res) => {
  const startTime = Date.now();
  try {
    const { payload, format = 'QR Code' } = req.body;
    if (!payload || !payload.trim()) {
      return res.status(400).json({ success: false, message: 'QR payload is required' });
    }

    const aiExplanation = await AIService.analyzeQR({ payload, format });
    const executionTimeMs = Date.now() - startTime;

    const record = await persistRecord({
      userId: req.user?.id || null,
      decoderType: 'qr',
      rawInput: payload,
      decodedOutput: payload,
      aiExplanation,
      metadata: {
        language: format,
        executionTimeMs
      }
    });

    res.json({
      success: true,
      data: record,
      executionTimeMs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const decodeImage = async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }

    const promptText = req.body.prompt || 'Analyze and extract all text and patterns from this image';
    const aiExplanation = await AIService.analyzeImage({
      imageBuffer: req.file.buffer,
      mimeType: req.file.mimetype,
      promptText
    });

    const executionTimeMs = Date.now() - startTime;
    const record = await persistRecord({
      userId: req.user?.id || null,
      decoderType: 'image',
      rawInput: `Image: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`,
      decodedOutput: aiExplanation.summary,
      aiExplanation,
      metadata: {
        language: req.file.mimetype,
        executionTimeMs
      }
    });

    res.json({
      success: true,
      data: record,
      executionTimeMs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const optimizePrompt = async (req, res) => {
  const startTime = Date.now();
  try {
    const promptText = req.body.promptText || req.body.prompt;
    const { targetModel = 'General LLM', goal = 'Max Performance' } = req.body;
    if (!promptText || !promptText.trim()) {
      return res.status(400).json({ success: false, message: 'Prompt text is required' });
    }

    const aiExplanation = await AIService.optimizePrompt({ promptText, targetModel, goal });
    const executionTimeMs = Date.now() - startTime;

    const record = await persistRecord({
      userId: req.user?.id || null,
      decoderType: 'prompt',
      rawInput: promptText,
      decodedOutput: aiExplanation.optimizedVersions?.standardProduction || aiExplanation.summary,
      aiExplanation,
      metadata: {
        language: targetModel,
        executionTimeMs
      }
    });

    res.json({
      success: true,
      data: record,
      executionTimeMs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
