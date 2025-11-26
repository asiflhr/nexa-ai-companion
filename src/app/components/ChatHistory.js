import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Plus, X, Edit2, Trash2, Check, MoreVertical } from 'lucide-react'
import { personas } from '@/lib/personas'

const ChatHistory = ({ chats, currentChatId, onChatSelect, onNewChat, onClose, isOpen, onRename, onDelete, isSidebar = false }) => {
  const [editingChatId, setEditingChatId] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleRenameClick = (chat, e) => {
    e.stopPropagation()
    setEditingChatId(chat._id)
    setNewTitle(chat.title)
    setActiveMenuId(null)
  }

  const handleRenameSubmit = (e) => {
    e.stopPropagation()
    if (newTitle.trim()) {
      onRename(editingChatId, newTitle)
      setEditingChatId(null)
    }
  }

  const handleDeleteClick = (chatId, e) => {
    e.stopPropagation()
    setShowDeleteConfirm(chatId)
    setActiveMenuId(null)
  }

  const handleDeleteConfirm = (chatId, e) => {
    e.stopPropagation()
    onDelete(chatId)
    setShowDeleteConfirm(null)
  }

  const toggleMenu = (chatId, e) => {
    e.stopPropagation()
    setActiveMenuId(activeMenuId === chatId ? null : chatId)
  }

  const Content = () => (
    <div className={`flex flex-col h-full ${isSidebar ? 'w-full' : 'bg-chat-bg-dark/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[80vh]'}`} onClick={(e) => e.stopPropagation()}>
      <div className='flex items-center justify-between mb-6 p-4 pb-0'>
        <h2 className='text-2xl font-bold text-white tracking-tight'>
          Chats
        </h2>
        {!isSidebar && (
          <button
            onClick={onClose}
            className='text-text-secondary hover:text-text-primary'
          >
            <X size={24} />
          </button>
        )}
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={() => {
            onNewChat()
            if (!isSidebar) onClose()
          }}
          className='w-full p-3.5 bg-gradient-to-r from-user-bubble to-accent-secondary text-white rounded-xl font-bold shadow-lg shadow-user-bubble/20 hover:shadow-user-bubble/30 hover:scale-[1.02] transition-all duration-200 flex items-center justify-center space-x-2'
        >
          <Plus size={20} />
          <span>New Chat</span>
        </button>
      </div>

      <div className='flex-1 overflow-y-auto space-y-3 custom-scrollbar px-4 pb-4'>
        {chats.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-40 text-text-secondary'>
            <MessageCircle size={40} className='mb-3 opacity-20' />
            <p>No chats yet</p>
          </div>
        ) : (
          chats.map((chat) => {
            const isActive = currentChatId === chat._id
            return (
              <motion.div
                key={chat._id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  onChatSelect(chat._id)
                  if (!isSidebar) onClose()
                }}
                className={`w-full p-3 rounded-xl border transition-all duration-300 relative group cursor-pointer ${
                  isActive
                    ? 'border-user-bubble bg-gradient-to-r from-user-bubble/90 to-accent-secondary/90 shadow-lg shadow-user-bubble/20'
                    : 'border-transparent bg-white/5 hover:bg-white/10 hover:border-white/10'
                } ${activeMenuId === chat._id ? 'z-50' : 'z-0'}`}
              >
                <div className='flex items-center space-x-3 relative z-10'>
                  {/* Avatar */}
                  <div className='relative flex-shrink-0'>
                    <div className={`text-2xl p-2 rounded-full transition-colors duration-300 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-chat-bg-dark text-white'
                    }`}>
                      {personas[chat.persona]?.avatar || '💖'}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
                      isActive ? 'border-accent-secondary' : 'border-chat-bg-dark'
                    }`} style={{ backgroundColor: personas[chat.persona]?.color || '#10b981' }} />
                  </div>
                  
                  {/* Content */}
                  <div className='flex-1 min-w-0 text-left'>
                    {editingChatId === chat._id ? (
                      <div className='flex items-center space-x-1' onClick={e => e.stopPropagation()}>
                        <input
                          type='text'
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRenameSubmit(e)
                            if (e.key === 'Escape') setEditingChatId(null)
                          }}
                          className='bg-chat-bg-dark text-white text-sm rounded px-2 py-1 w-full outline-none border border-user-bubble min-w-0'
                          autoFocus
                        />
                        <button
                          onClick={handleRenameSubmit}
                          className='p-1 bg-user-bubble rounded text-white hover:bg-accent-secondary flex-shrink-0'
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingChatId(null)
                          }}
                          className='p-1 bg-gray-600 rounded text-white hover:bg-gray-700 flex-shrink-0'
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className='flex justify-between items-start'>
                          <h3 className={`font-bold text-sm truncate pr-2 ${
                            isActive ? 'text-white' : 'text-white group-hover:text-user-bubble transition-colors'
                          }`}>
                            {chat.title}
                          </h3>
                          {/* Date - Hidden on hover to make room for menu if needed, but menu is absolute so maybe not */}
                          <span className={`text-[10px] flex-shrink-0 ${
                            isActive ? 'text-white/80' : 'text-gray-500'
                          }`}>
                            {new Date(chat.lastActivity).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 truncate ${
                          isActive ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          {personas[chat.persona]?.name || 'Unknown'}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Menu Button */}
                  {editingChatId !== chat._id && showDeleteConfirm !== chat._id && (
                    <div className='relative'>
                      <button
                        onClick={(e) => toggleMenu(chat._id, e)}
                        className={`p-1.5 rounded-full transition-all duration-200 ${
                          isActive 
                            ? 'text-white/80 hover:bg-white/20' 
                            : 'text-gray-400 hover:text-white hover:bg-user-bubble opacity-0 group-hover:opacity-100'
                        } ${activeMenuId === chat._id ? 'opacity-100 bg-white/10' : ''}`}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenuId === chat._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className='absolute right-0 top-8 w-32 bg-chat-bg-dark border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden'
                            ref={menuRef}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => handleRenameClick(chat, e)}
                              className='w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-user-bubble hover:text-white flex items-center gap-2 transition-colors'
                            >
                              <Edit2 size={14} />
                              Rename
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(chat._id, e)}
                              className='w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center gap-2 transition-colors'
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Delete Confirmation Overlay */}
                  {showDeleteConfirm === chat._id && (
                    <div className='absolute inset-0 bg-black/90 flex items-center justify-center gap-3 z-20 rounded-xl backdrop-blur-sm' onClick={e => e.stopPropagation()}>
                      <span className='text-sm font-bold text-white'>Delete?</span>
                      <button
                        onClick={(e) => handleDeleteConfirm(chat._id, e)}
                        className='p-1.5 bg-red-600 rounded-md text-white hover:bg-red-700 transition-colors'
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteConfirm(null)
                        }}
                        className='p-1.5 bg-gray-600 rounded-md text-white hover:bg-gray-700 transition-colors'
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )

  if (isSidebar) {
    return <Content />
  }

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
            className='w-full max-w-md'
            onClick={(e) => e.stopPropagation()}
          >
            <Content />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ChatHistory