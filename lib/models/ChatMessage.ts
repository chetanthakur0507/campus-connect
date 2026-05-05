import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  senderSessionId: {
    type: String,
    required: true,
    index: true,
  },
  receiverSessionId: {
    type: String,
    required: true,
    index: true,
  },
  senderName: String,
  senderAvatar: String,
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  status: {
    type: String,
    enum: ['sent', 'read'],
    default: 'sent',
  },
}, { timestamps: true });

// Compound index for fetching messages between two users
chatMessageSchema.index({ senderSessionId: 1, receiverSessionId: 1, timestamp: 1 });
chatMessageSchema.index({ receiverSessionId: 1, senderSessionId: 1, timestamp: 1 });

export default mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
