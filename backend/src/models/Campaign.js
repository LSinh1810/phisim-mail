import mongoose from 'mongoose';
import { Click } from './Click.js'

const campaignSchema = new mongoose.Schema({
  name: String,
  subject: String,
  message: String,
  recipients: [String],
  sentAt: Date,
  clicks: [
    {
      email: String,
      clickedAt: Date,
    },
  ],
});

campaignSchema.pre('findOneAndDelete', async function (next) {
  try {
    const campaign = await this.model.findOne(this.getFilter());
    if (campaign) {
      await Click.deleteMany({ campaignId: campaign._id }); // xóa các click liên quan
    }
    next();
  } catch (err) {
    next(err);
  }
});

export const Campaign = mongoose.model('Campaign', campaignSchema);