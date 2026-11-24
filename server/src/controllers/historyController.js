import { getIsMongoConnected } from '../config/db.js';
import { DecodeRecord } from '../models/MongooseModels.js';
import { LocalStore } from '../models/LocalStore.js';

export const getHistory = async (req, res) => {
  try {
    const { type, search, bookmarkedOnly } = req.query;
    const isMongo = getIsMongoConnected();
    const userId = req.user?.id || null;

    let items;
    if (isMongo) {
      const query = {};
      if (userId) query.userId = userId;
      if (type && type !== 'all') query.decoderType = type;
      if (bookmarkedOnly === 'true') query.isBookmarked = true;
      if (search) {
        query.$or = [
          { rawInput: { $regex: search, $options: 'i' } },
          { decodedOutput: { $regex: search, $options: 'i' } },
          { 'aiExplanation.summary': { $regex: search, $options: 'i' } }
        ];
      }
      items = await DecodeRecord.find(query).sort({ createdAt: -1 }).limit(100);
    } else {
      items = await LocalStore.getDecodes({
        userId,
        type,
        search,
        bookmarkedOnly: bookmarkedOnly === 'true'
      });
    }

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const isMongo = getIsMongoConnected();

    let updated;
    if (isMongo) {
      const item = await DecodeRecord.findById(id);
      if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
      item.isBookmarked = !item.isBookmarked;
      await item.save();
      updated = item;
    } else {
      updated = await LocalStore.toggleBookmark(id);
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({
      success: true,
      item: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const isMongo = getIsMongoConnected();

    let deleted = false;
    if (isMongo) {
      const result = await DecodeRecord.findByIdAndDelete(id);
      deleted = !!result;
    } else {
      deleted = await LocalStore.deleteDecode(id);
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const exportHistory = async (req, res) => {
  try {
    const { format = 'json' } = req.query;
    const isMongo = getIsMongoConnected();

    let items;
    if (isMongo) {
      items = await DecodeRecord.find().sort({ createdAt: -1 });
    } else {
      items = await LocalStore.getDecodes({});
    }

    if (format === 'markdown') {
      let md = `# AI DECODER — Exported Decoding Vault\nGenerated on: ${new Date().toISOString()}\n\n`;
      items.forEach((item, index) => {
        md += `## ${index + 1}. [${item.decoderType.toUpperCase()}] ${item.aiExplanation?.detectedFormat || 'Unknown'}\n`;
        md += `- **Date**: ${new Date(item.createdAt).toLocaleString()}\n`;
        md += `- **Summary**: ${item.aiExplanation?.summary || 'N/A'}\n`;
        md += `- **Security Audit**: ${item.aiExplanation?.securityAudit || 'N/A'}\n`;
        md += `- **Complexity**: ${item.aiExplanation?.complexity || 'N/A'}\n\n`;
        md += `### Input:\n\`\`\`\n${item.rawInput}\n\`\`\`\n\n`;
        md += `### Output / Decoded Result:\n\`\`\`\n${item.decodedOutput}\n\`\`\`\n\n---\n\n`;
      });

      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="ai-decoder-vault.md"');
      return res.send(md);
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="ai-decoder-vault.json"');
    res.json({ exportedAt: new Date().toISOString(), total: items.length, records: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
