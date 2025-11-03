import mongoose from 'mongoose';

const clickSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  ip: String,
  userAgent: String,
  referrer: String,
  acceptLanguage: String,
  xForwardedFor: String,
}, {
  timestamps: true,
});

// Index để query nhanh hơn
clickSchema.index({ campaignId: 1, timestamp: -1 });
clickSchema.index({ email: 1 });

export const Click = mongoose.model('Click', clickSchema);

