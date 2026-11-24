import mongoose from 'mongoose';

const decodeRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    decoderType: {
      type: String,
      required: true,
      enum: ['text', 'code', 'cipher', 'qr', 'image', 'jwt', 'prompt', 'url', 'base64'],
      index: true
    },
    rawInput: {
      type: String,
      required: [true, 'Raw input string is required'],
      maxlength: [100000, 'Payload exceeds maximum length']
    },
    decodedOutput: {
      type: String,
      required: true
    },
    aiExplanation: {
      summary: { type: String, default: '' },
      breakdown: { type: [String], default: [] },
      securityAudit: { type: String, default: '' },
      complexity: { type: String, default: '' },
      detectedFormat: { type: String, default: '' },
      scores: {
        overall: Number,
        clarity: Number,
        constraints: Number,
        structure: Number,
        tokenEfficiency: Number
      },
      critique: {
        strengths: [String],
        weaknesses: [String],
        antiPatternsDetected: [String]
      },
      optimizedVersions: {
        standardProduction: String,
        chainOfThought: String,
        fewShotSchema: String
      }
    },
    metadata: {
      language: { type: String, default: 'text' },
      executionTimeMs: { type: Number, default: 0 },
      tokenEstimate: { type: Number, default: 0 },
      clientIp: { type: String }
    },
    isBookmarked: {
      type: Boolean,
      default: false,
      index: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound Indexes for fast dashboard query performance
decodeRecordSchema.index({ userId: 1, createdAt: -1 });
decodeRecordSchema.index({ decoderType: 1, isBookmarked: 1 });
decodeRecordSchema.index({ 'aiExplanation.detectedFormat': 1 });

export const DecodeRecord =
  mongoose.models.DecodeRecord || mongoose.model('DecodeRecord', decodeRecordSchema);
