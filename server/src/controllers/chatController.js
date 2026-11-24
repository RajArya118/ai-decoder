import { AIService } from '../services/aiService.js';
import { getIsMongoConnected } from '../config/db.js';
import { DecodeRecord, ChatMessage } from '../models/MongooseModels.js';
import { LocalStore } from '../models/LocalStore.js';

export const sendMessage = async (req, res) => {
  try {
    const { decodeId, message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const isMongo = getIsMongoConnected();
    let record;

    if (decodeId) {
      if (isMongo) {
        record = await DecodeRecord.findById(decodeId);
      } else {
        record = await LocalStore.getDecodeById(decodeId);
      }
    }

    const context = record || {
      decoderType: 'general',
      rawInput: 'General inquiry',
      decodedOutput: 'General AI Assistant'
    };

    // Load existing messages
    let history = [];
    if (decodeId) {
      if (isMongo) {
        history = await ChatMessage.find({ decodeId }).sort({ timestamp: 1 });
      } else {
        history = await LocalStore.getChatHistory(decodeId);
      }
    }

    // Save User Message
    if (isMongo) {
      await ChatMessage.create({
        userId: req.user?.id || null,
        decodeId: decodeId || 'general',
        role: 'user',
        content: message
      });
    } else {
      await LocalStore.saveChatMessage({
        userId: req.user?.id || null,
        decodeId: decodeId || 'general',
        role: 'user',
        content: message
      });
    }

    // Generate AI response
    const aiResponseText = await AIService.chatWithContext({
      context,
      history,
      message
    });

    // Save Assistant Message
    let savedAssistantMsg;
    if (isMongo) {
      savedAssistantMsg = await ChatMessage.create({
        userId: req.user?.id || null,
        decodeId: decodeId || 'general',
        role: 'assistant',
        content: aiResponseText
      });
    } else {
      savedAssistantMsg = await LocalStore.saveChatMessage({
        userId: req.user?.id || null,
        decodeId: decodeId || 'general',
        role: 'assistant',
        content: aiResponseText
      });
    }

    res.json({
      success: true,
      message: savedAssistantMsg
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { decodeId } = req.params;
    const isMongo = getIsMongoConnected();

    let messages = [];
    if (isMongo) {
      messages = await ChatMessage.find({ decodeId }).sort({ timestamp: 1 });
    } else {
      messages = await LocalStore.getChatHistory(decodeId);
    }

    res.json({
      success: true,
      messages
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
