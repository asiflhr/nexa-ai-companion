import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Plus, X } from 'lucide-react'
import { personas } from '@/lib/personas'

const ChatHistory = ({ chats, onChatSelect, onNewChat, onClose, isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
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
            className='bg-[--color-chat-bg-dark] rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-bold text-[--color-text-primary]'>
                Chat History
              </h2>
              <button
                onClick={onClose}
                className='text-[--color-text-secondary] hover:text-[--color-text-primary]'
              >
                <X size={24} />
              </button>
            </div>

            <button
              onClick={() => {
                onNewChat()
                onClose()
              }}
              className='w-full p-3 bg-[--color-user-bubble] text-white rounded-lg font-semibold mb-4 flex items-center justify-center space-x-2'
            >
              <Plus size={20} />
              <span>New Chat</span>
            </button>

            <div className='flex-1 overflow-y-auto space-y-2'>
              {chats.length === 0 ? (
                <p className='text-[--color-text-secondary] text-center py-8'>
                  No chat history yet
                </p>
              ) : (
                chats.map((chat) => (
                  <motion.button
                    key={chat._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onChatSelect(chat._id)
                      onClose()
                    }}
                    className='w-full p-3 bg-[--color-ai-bubble] rounded-lg text-left hover:bg-opacity-80 transition-all'
                  >
                    <div className='flex items-center space-x-3'>
                      <span className='text-xl'>
                        {personas[chat.persona]?.avatar || '💖'}
                      </span>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-medium text-[--color-text-primary] truncate'>
                          {chat.title}
                        </h3>
                        <p className='text-sm text-[--color-text-secondary]'>
                          {new Date(chat.lastActivity).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ChatHistory