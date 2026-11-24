import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {}
}

async function readJSON(filename, defaultVal = []) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

async function writeJSON(filename, data) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export const LocalStore = {
  // Users
  async findUserByEmail(email) {
    const users = await readJSON('users.json', []);
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  async findUserById(id) {
    const users = await readJSON('users.json', []);
    return users.find((u) => u.id === id || u._id === id);
  },

  async findUserByApiKey(apiKey) {
    const users = await readJSON('users.json', []);
    return users.find((u) => u.apiKey === apiKey);
  },

  async getAllUsers() {
    const users = await readJSON('users.json', []);
    return users.map(({ password, ...safeUser }) => safeUser);
  },

  async createUser(userData) {
    const users = await readJSON('users.json', []);
    const id = crypto.randomUUID();
    const newUser = {
      id,
      _id: id,
      role: 'user',
      apiKey: 'aid_' + crypto.randomBytes(16).toString('hex'),
      isActive: true,
      usageQuota: {
        requestsToday: 0,
        maxRequestsPerDay: 500,
        lastResetDate: new Date().toISOString()
      },
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.push(newUser);
    await writeJSON('users.json', users);
    return newUser;
  },

  // Decodes
  async saveDecode(decodeData) {
    const decodes = await readJSON('decodes.json', []);
    const id = crypto.randomUUID();
    const record = {
      id,
      _id: id,
      isBookmarked: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...decodeData
    };
    decodes.unshift(record);
    if (decodes.length > 500) decodes.pop();
    await writeJSON('decodes.json', decodes);
    return record;
  },

  async getDecodes({ userId, type, search, bookmarkedOnly }) {
    let decodes = await readJSON('decodes.json', []);
    if (userId) {
      decodes = decodes.filter((d) => d.userId === userId || !d.userId);
    }
    if (type && type !== 'all') {
      decodes = decodes.filter((d) => d.decoderType === type);
    }
    if (bookmarkedOnly) {
      decodes = decodes.filter((d) => d.isBookmarked);
    }
    if (search) {
      const q = search.toLowerCase();
      decodes = decodes.filter(
        (d) =>
          d.rawInput?.toLowerCase().includes(q) ||
          d.decodedOutput?.toLowerCase().includes(q) ||
          d.aiExplanation?.summary?.toLowerCase().includes(q)
      );
    }
    return decodes;
  },

  async getDecodeById(id) {
    const decodes = await readJSON('decodes.json', []);
    return decodes.find((d) => d.id === id || d._id === id);
  },

  async toggleBookmark(id) {
    const decodes = await readJSON('decodes.json', []);
    const item = decodes.find((d) => d.id === id || d._id === id);
    if (!item) return null;
    item.isBookmarked = !item.isBookmarked;
    item.updatedAt = new Date().toISOString();
    await writeJSON('decodes.json', decodes);
    return item;
  },

  async deleteDecode(id) {
    let decodes = await readJSON('decodes.json', []);
    const initialLen = decodes.length;
    decodes = decodes.filter((d) => d.id !== id && d._id !== id);
    if (decodes.length !== initialLen) {
      await writeJSON('decodes.json', decodes);
      return true;
    }
    return false;
  },

  // Telemetry & Aggregation
  async getStats() {
    const decodes = await readJSON('decodes.json', []);
    const users = await readJSON('users.json', []);
    const chats = await readJSON('chats.json', []);

    const typeBreakdown = decodes.reduce((acc, curr) => {
      const t = curr.decoderType || 'unknown';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    const bookmarkedCount = decodes.filter((d) => d.isBookmarked).length;
    const avgLatency =
      decodes.length > 0
        ? Math.round(
            decodes.reduce((sum, d) => sum + (d.metadata?.executionTimeMs || 0), 0) /
              decodes.length
          )
        : 0;

    return {
      totalDecodes: decodes.length,
      totalUsers: users.length,
      totalChatMessages: chats.length,
      bookmarkedCount,
      avgLatencyMs: avgLatency,
      typeBreakdown
    };
  },

  // Chat
  async saveChatMessage({ decodeId, role, content, userId }) {
    const chats = await readJSON('chats.json', []);
    const msg = {
      id: crypto.randomUUID(),
      decodeId,
      userId: userId || null,
      role,
      content,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    chats.push(msg);
    await writeJSON('chats.json', chats);
    return msg;
  },

  async getChatHistory(decodeId) {
    const chats = await readJSON('chats.json', []);
    return chats.filter((c) => c.decodeId === decodeId);
  },

  // Audit Logs
  async logAudit({ action, userId, ipAddress, details, status = 'SUCCESS' }) {
    const logs = await readJSON('audit_logs.json', []);
    const log = {
      id: crypto.randomUUID(),
      action,
      userId: userId || null,
      ipAddress: ipAddress || '127.0.0.1',
      details,
      status,
      timestamp: new Date().toISOString()
    };
    logs.unshift(log);
    if (logs.length > 1000) logs.pop();
    await writeJSON('audit_logs.json', logs);
    return log;
  },

  async getAuditLogs(limit = 50) {
    const logs = await readJSON('audit_logs.json', []);
    return logs.slice(0, limit);
  }
};
