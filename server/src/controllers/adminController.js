import { getIsMongoConnected } from '../config/db.js';
import { User } from '../models/User.js';
import { DecodeRecord } from '../models/DecodeRecord.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { AuditLog } from '../models/AuditLog.js';
import { LocalStore } from '../models/LocalStore.js';

export const getSystemStats = async (req, res) => {
  try {
    const isMongo = getIsMongoConnected();

    if (isMongo) {
      const [totalDecodes, totalUsers, totalChats, bookmarkedCount, typeAgg] =
        await Promise.all([
          DecodeRecord.countDocuments(),
          User.countDocuments(),
          ChatMessage.countDocuments(),
          DecodeRecord.countDocuments({ isBookmarked: true }),
          DecodeRecord.aggregate([
            { $group: { _id: '$decoderType', count: { $sum: 1 } } }
          ])
        ]);

      const typeBreakdown = typeAgg.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      return res.json({
        success: true,
        database: 'MongoDB Atlas',
        stats: {
          totalDecodes,
          totalUsers,
          totalChatMessages: totalChats,
          bookmarkedCount,
          typeBreakdown
        }
      });
    } else {
      const stats = await LocalStore.getStats();
      return res.json({
        success: true,
        database: 'Local Document Store (Parity Mode)',
        stats
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const isMongo = getIsMongoConnected();
    let users;

    if (isMongo) {
      users = await User.find().select('-password').sort({ createdAt: -1 });
    } else {
      users = await LocalStore.getAllUsers();
    }

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const isMongo = getIsMongoConnected();
    let logs;

    if (isMongo) {
      logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    } else {
      logs = await LocalStore.getAuditLogs(100);
    }

    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
