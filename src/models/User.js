import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  selectedPersona: {
    type: String,
    default: 'niko',
  },
  preferences: {
    theme: {
      type: String,
      default: 'dark',
    },
    notifications: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
})

export default mongoose.models.User || mongoose.model('User', UserSchema)