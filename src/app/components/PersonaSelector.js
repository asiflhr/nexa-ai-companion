import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { personas } from '@/lib/personas'
import { Plus, Edit2 } from 'lucide-react'
import CompanionEditorModal from './CompanionEditorModal'

const PersonaSelector = ({ selectedPersona, onPersonaChange, onClose }) => {
  const [customCompanions, setCustomCompanions] = useState([])
  const [showEditor, setShowEditor] = useState(false)
  const [editingCompanion, setEditingCompanion] = useState(null)
  const [allPersonas, setAllPersonas] = useState({})

  useEffect(() => {
    loadCustomCompanions()
  }, [])

  useEffect(() => {
    // Merge default personas with custom companions
    const merged = { ...personas }
    customCompanions.forEach(comp => {
      merged[comp._id] = {
        name: comp.name,
        description: comp.description,
        avatar: comp.avatar,
        color: comp.color,
        systemPrompt: comp.systemPrompt,
        isCustom: true
      }
    })
    setAllPersonas(merged)
  }, [customCompanions])

  const loadCustomCompanions = async () => {
    try {
      const response = await fetch('/api/companions')
      if (response.ok) {
        const companions = await response.json()
        setCustomCompanions(companions)
      }
    } catch (error) {
      console.error('Failed to load companions:', error)
    }
  }

  const handleCreateCompanion = async (companionData) => {
    try {
      const response = await fetch('/api/companions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companionData)
      })
      
      if (response.ok) {
        await loadCustomCompanions()
        setShowEditor(false)
      }
    } catch (error) {
      console.error('Failed to create companion:', error)
      throw error
    }
  }

  const handleUpdateCompanion = async (companionData) => {
    try {
      const response = await fetch(`/api/companions/${editingCompanion._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companionData)
      })
      
      if (response.ok) {
        await loadCustomCompanions()
        setShowEditor(false)
        setEditingCompanion(null)
      }
    } catch (error) {
      console.error('Failed to update companion:', error)
      throw error
    }
  }

  const handleEdit = (e, companion) => {
    e.stopPropagation()
    setEditingCompanion(companion)
    setShowEditor(true)
  }

  const handleAddNew = () => {
    setEditingCompanion(null)
    setShowEditor(true)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className='bg-chat-bg-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto'
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className='text-xl font-bold text-text-primary mb-4 text-center'>
            Choose Your AI Companion
          </h2>
          
          <div className='space-y-3'>
            {/* Add New Companion Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddNew}
              className='w-full p-4 rounded-xl border-2 border-dashed border-user-bubble/50 hover:border-user-bubble bg-white/5 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 text-user-bubble'
            >
              <Plus size={20} />
              <span className='font-semibold'>Create Custom Companion</span>
            </motion.button>

            {/* Default Personas */}
            {Object.entries(personas).map(([id, persona]) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onPersonaChange(id)
                  onClose()
                }}
                className={`w-full p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                  selectedPersona === id
                    ? 'border-user-bubble bg-gradient-to-r from-user-bubble to-accent-secondary text-white shadow-lg shadow-user-bubble/20'
                    : 'border-white/10 bg-white/5 hover:border-user-bubble hover:shadow-md hover:shadow-user-bubble/10'
                }`}
              >
                <div className={`absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${selectedPersona === id ? 'hidden' : ''}`} />
                
                <div className='flex items-center space-x-4 relative z-10'>
                  <div className={`text-3xl p-2 rounded-full ${selectedPersona === id ? 'bg-white/20' : 'bg-chat-bg-dark'}`}>
                    {persona.avatar}
                  </div>
                  <div className='text-left flex-1'>
                    <h3 className={`font-bold text-lg ${selectedPersona === id ? 'text-white' : 'text-white group-hover:text-user-bubble transition-colors'}`}>
                      {persona.name}
                    </h3>
                    <p className={`text-sm ${selectedPersona === id ? 'text-white/90' : 'text-gray-400'}`}>
                      {persona.description}
                    </p>
                  </div>
                  {selectedPersona === id && (
                    <div className='w-3 h-3 bg-white rounded-full shadow-sm animate-pulse' />
                  )}
                </div>
              </motion.button>
            ))}

            {/* Custom Companions */}
            {customCompanions.map((companion) => (
              <motion.button
                key={companion._id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onPersonaChange(companion._id)
                  onClose()
                }}
                className={`w-full p-4 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                  selectedPersona === companion._id
                    ? 'border-user-bubble bg-gradient-to-r from-user-bubble to-accent-secondary text-white shadow-lg shadow-user-bubble/20'
                    : 'border-white/10 bg-white/5 hover:border-user-bubble hover:shadow-md hover:shadow-user-bubble/10'
                }`}
              >
                <div className={`absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${selectedPersona === companion._id ? 'hidden' : ''}`} />
                
                <div className='flex items-center space-x-4 relative z-10'>
                  <div className={`text-3xl p-2 rounded-full ${selectedPersona === companion._id ? 'bg-white/20' : 'bg-chat-bg-dark'}`}>
                    {companion.avatar}
                  </div>
                  <div className='text-left flex-1'>
                    <h3 className={`font-bold text-lg ${selectedPersona === companion._id ? 'text-white' : 'text-white group-hover:text-user-bubble transition-colors'}`}>
                      {companion.name}
                    </h3>
                    <p className={`text-sm ${selectedPersona === companion._id ? 'text-white/90' : 'text-gray-400'}`}>
                      {companion.description}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={(e) => handleEdit(e, companion)}
                      className={`p-2 rounded-full transition-all ${
                        selectedPersona === companion._id
                          ? 'bg-white/20 text-white'
                          : 'bg-white/10 text-gray-400 hover:text-white hover:bg-user-bubble'
                      }`}
                    >
                      <Edit2 size={16} />
                    </button>
                    {selectedPersona === companion._id && (
                      <div className='w-3 h-3 bg-white rounded-full shadow-sm animate-pulse' />
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Companion Editor Modal */}
      <CompanionEditorModal
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false)
          setEditingCompanion(null)
        }}
        companion={editingCompanion}
        onSave={editingCompanion ? handleUpdateCompanion : handleCreateCompanion}
      />
    </>
  )
}

export default PersonaSelector