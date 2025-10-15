import { motion } from 'framer-motion'
import { personas } from '@/lib/personas'

const PersonaSelector = ({ selectedPersona, onPersonaChange, onClose }) => {
  return (
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
        className='bg-[--color-chat-bg-dark] rounded-2xl p-6 w-full max-w-md'
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className='text-xl font-bold text-[--color-text-primary] mb-4 text-center'>
          Choose Your AI Companion
        </h2>
        
        <div className='space-y-3'>
          {Object.entries(personas).map(([id, persona]) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onPersonaChange(id)
                onClose()
              }}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedPersona === id
                  ? 'border-[--color-user-bubble] bg-[--color-user-bubble] bg-opacity-10'
                  : 'border-[--color-border-subtle] hover:border-[--color-user-bubble] hover:border-opacity-50'
              }`}
            >
              <div className='flex items-center space-x-3'>
                <span className='text-2xl'>{persona.avatar}</span>
                <div className='text-left'>
                  <h3 className='font-semibold text-[--color-text-primary]'>
                    {persona.name}
                  </h3>
                  <p className='text-sm text-[--color-text-secondary]'>
                    {persona.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PersonaSelector