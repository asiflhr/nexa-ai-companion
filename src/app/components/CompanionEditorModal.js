import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Loader2 } from 'lucide-react'

const PERSONALITY_TRAITS = [
  { id: 'friendliness', name: 'Friendliness', description: 'How warm and approachable' },
  { id: 'energy', name: 'Energy Level', description: 'How energetic and enthusiastic' },
  { id: 'empathy', name: 'Empathy', description: 'How understanding and compassionate' },
  { id: 'humor', name: 'Humor', description: 'How playful and funny' },
  { id: 'wisdom', name: 'Wisdom', description: 'How thoughtful and insightful' },
  { id: 'creativity', name: 'Creativity', description: 'How imaginative and artistic' },
  { id: 'confidence', name: 'Confidence', description: 'How assertive and self-assured' },
  { id: 'curiosity', name: 'Curiosity', description: 'How inquisitive and interested' },
  { id: 'patience', name: 'Patience', description: 'How calm and understanding' },
  { id: 'adventurousness', name: 'Adventurousness', description: 'How bold and daring' }
]

const EMOJI_OPTIONS = ['💖', '🌙', '⚡', '🧘', '🌟', '🎭', '🦋', '🌺', '🎨', '🔮', '🌈', '✨']
const COLOR_OPTIONS = ['#7c3aed', '#f472b6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899']

const CompanionEditorModal = ({ isOpen, onClose, companion = null, onSave }) => {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('other')
  const [avatar, setAvatar] = useState('💖')
  const [color, setColor] = useState('#7c3aed')
  const [description, setDescription] = useState('')
  const [traits, setTraits] = useState(
    PERSONALITY_TRAITS.map(t => ({ name: t.name, value: 50 }))
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (companion) {
      setName(companion.name || '')
      setGender(companion.gender || 'other')
      setAvatar(companion.avatar || '💖')
      setColor(companion.color || '#7c3aed')
      setDescription(companion.description || '')
      if (companion.personalityTraits && companion.personalityTraits.length > 0) {
        setTraits(companion.personalityTraits)
      }
    } else {
      // Reset for new companion
      setName('')
      setGender('other')
      setAvatar('💖')
      setColor('#7c3aed')
      setDescription('')
      setTraits(PERSONALITY_TRAITS.map(t => ({ name: t.name, value: 50 })))
    }
  }, [companion, isOpen])

  const handleTraitChange = (index, value) => {
    const newTraits = [...traits]
    newTraits[index].value = value
    setTraits(newTraits)
  }

  const generateDescription = async () => {
    if (!name.trim()) {
      alert('Please enter a name first')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, gender, personalityTraits: traits })
      })

      if (response.ok) {
        const { description: generatedDesc } = await response.json()
        setDescription(generatedDesc)
      } else {
        alert('Failed to generate description')
      }
    } catch (error) {
      console.error('Error generating description:', error)
      alert('Failed to generate description')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateSystemPrompt = () => {
    const traitDescriptions = traits
      .filter(t => t.value > 60)
      .map(t => t.name.toLowerCase())
      .join(', ')

    return `You are ${name}, a ${gender} AI companion. ${description}

Your personality is characterized by: ${traitDescriptions}.

Engage in natural, supportive conversations. Be yourself and let your unique personality shine through. Keep responses conversational and emotionally expressive, using emojis where appropriate.`
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a name')
      return
    }

    if (!description.trim()) {
      alert('Please generate or enter a description')
      return
    }

    setIsSaving(true)
    try {
      const companionData = {
        name,
        gender,
        avatar,
        color,
        description,
        personalityTraits: traits,
        systemPrompt: generateSystemPrompt()
      }

      await onSave(companionData)
      onClose()
    } catch (error) {
      console.error('Error saving companion:', error)
      alert('Failed to save companion')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className='bg-chat-bg-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-2xl my-8'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-2xl font-bold text-white'>
              {companion ? 'Edit Companion' : 'Create New Companion'}
            </h2>
            <button
              onClick={onClose}
              className='text-text-secondary hover:text-white transition-colors'
            >
              <X size={24} />
            </button>
          </div>

          <div className='space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar'>
            {/* Name */}
            <div>
              <label className='block text-sm font-medium text-text-secondary mb-2'>
                Name *
              </label>
              <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Enter companion name'
                className='w-full bg-white/5 text-text-primary placeholder-text-placeholder rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-user-bubble/50 transition-all border border-white/10'
              />
            </div>

            {/* Gender */}
            <div>
              <label className='block text-sm font-medium text-text-secondary mb-2'>
                Gender
              </label>
              <div className='grid grid-cols-4 gap-2'>
                {['male', 'female', 'non-binary', 'other'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      gender === g
                        ? 'bg-gradient-to-r from-user-bubble to-accent-secondary text-white'
                        : 'bg-white/5 text-text-secondary hover:bg-white/10'
                    }`}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar & Color */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-text-secondary mb-2'>
                  Avatar
                </label>
                <div className='grid grid-cols-6 gap-2'>
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setAvatar(emoji)}
                      className={`text-2xl p-2 rounded-lg transition-all ${
                        avatar === emoji
                          ? 'bg-user-bubble scale-110'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-text-secondary mb-2'>
                  Color
                </label>
                <div className='grid grid-cols-4 gap-2'>
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-full h-10 rounded-lg transition-all ${
                        color === c ? 'ring-2 ring-white scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Personality Traits */}
            <div>
              <label className='block text-sm font-medium text-text-secondary mb-3'>
                Personality Traits
              </label>
              <div className='space-y-3'>
                {PERSONALITY_TRAITS.map((trait, index) => (
                  <div key={trait.id}>
                    <div className='flex justify-between items-center mb-1'>
                      <span className='text-sm text-white'>{trait.name}</span>
                      <span className='text-xs text-text-secondary'>{traits[index]?.value}%</span>
                    </div>
                    <input
                      type='range'
                      min='0'
                      max='100'
                      value={traits[index]?.value || 50}
                      onChange={(e) => handleTraitChange(index, parseInt(e.target.value))}
                      className='w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider'
                      style={{
                        background: `linear-gradient(to right, ${color} 0%, ${color} ${traits[index]?.value}%, rgba(255,255,255,0.1) ${traits[index]?.value}%, rgba(255,255,255,0.1) 100%)`
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className='flex justify-between items-center mb-2'>
                <label className='block text-sm font-medium text-text-secondary'>
                  Personality Description *
                </label>
                <button
                  onClick={generateDescription}
                  disabled={isGenerating}
                  className='flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-user-bubble to-accent-secondary text-white text-sm rounded-lg hover:shadow-lg transition-all disabled:opacity-50'
                >
                  {isGenerating ? (
                    <Loader2 size={14} className='animate-spin' />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  Generate with AI
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='AI will generate a description based on personality traits...'
                rows={4}
                className='w-full bg-white/5 text-text-primary placeholder-text-placeholder rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-user-bubble/50 transition-all border border-white/10 resize-none'
              />
            </div>
          </div>

          {/* Footer */}
          <div className='flex gap-3 mt-6 pt-6 border-t border-white/10'>
            <button
              onClick={onClose}
              className='flex-1 px-4 py-3 bg-white/5 text-text-secondary rounded-lg hover:bg-white/10 transition-all'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className='flex-1 px-4 py-3 bg-gradient-to-r from-user-bubble to-accent-secondary text-white rounded-lg hover:shadow-lg hover:shadow-user-bubble/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2'
            >
              {isSaving ? (
                <>
                  <Loader2 size={18} className='animate-spin' />
                  Saving...
                </>
              ) : (
                companion ? 'Update Companion' : 'Create Companion'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CompanionEditorModal
