import mongoose from 'mongoose'

const PersonalityTraitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, required: true, min: 0, max: 100 }
})

const CompanionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'other'],
    default: 'other'
  },
  avatar: {
    type: String,
    default: '💖'
  },
  color: {
    type: String,
    default: '#7c3aed'
  },
  description: {
    type: String,
    default: ''
  },
  personalityTraits: [PersonalityTraitSchema],
  systemPrompt: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    default: []
  },
  isCustom: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt timestamp before saving
CompanionSchema.pre('save', function(next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.models.Companion || mongoose.model('Companion', CompanionSchema)
