import mongoose from 'mongoose'

const MessageSchema = new mongoose.Schema({
  id: String,
  text: String,
  type: {
    type: String,
    enum: ['user', 'ai'],
  },
  timestamp: String,
}, { _id: false })

const ChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'New Chat',
  },
  persona: {
    type: String,
    default: 'niko',
  },
  messages: [MessageSchema],
  summary: {
    type: String,
    default: '',
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
})

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema)