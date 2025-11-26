// app/page.js
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Loader2,
  ArrowLeft,
  MoreVertical,
  Paperclip,
  Smile,
  MessageCircle,
  User,
  LogOut,
  Settings,
} from 'lucide-react'
import ChatBubble from './components/ChatBubble'
import TypingDots from './components/TypingDots'
import PersonaSelector from './components/PersonaSelector'
import ChatHistory from './components/ChatHistory'
import { v4 as uuidv4 } from 'uuid'
import { personas } from '@/lib/personas'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoadingGemini, setIsLoadingGemini] = useState(false)
  const [currentPersona, setCurrentPersona] = useState('niko')
  const [showPersonaSelector, setShowPersonaSelector] = useState(false)
  const [showChatHistory, setShowChatHistory] = useState(false)
  const [chats, setChats] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [chatSummary, setChatSummary] = useState('')
  const audioRef = useRef(null)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      loadChats()
    }
  }, [session])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chats')
      if (response.ok) {
        const data = await response.json()
        setChats(data)
      }
    } catch (error) {
      console.error('Failed to load chats:', error)
    }
  }

  const createNewChat = () => {
    // Just reset the UI state, don't create DB entry yet
    setCurrentChatId(null)
    setMessages([])
    setChatSummary('')
  }

  const loadChat = async (chatId) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`)
      if (response.ok) {
        const chat = await response.json()
        setMessages(chat.messages)
        setCurrentPersona(chat.persona)
        setChatSummary(chat.summary || '')
        setCurrentChatId(chatId)
      }
    } catch (error) {
      console.error('Failed to load chat:', error)
    }
  }

  const saveChat = async (newMessages, summary = chatSummary, chatIdToUse = null) => {
    const targetChatId = chatIdToUse || currentChatId
    if (!targetChatId) return
    
    try {
      await fetch(`/api/chats/${targetChatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, summary })
      })
    } catch (error) {
      console.error('Failed to save chat:', error)
    }
  }

  const summarizeChat = async (messages) => {
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
      })
      if (response.ok) {
        const { summary } = await response.json()
        return summary
      }
    } catch (error) {
      console.error('Failed to summarize:', error)
    }
    return ''
  }

  const handleRenameChat = async (chatId, newTitle) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      })
      if (response.ok) {
        loadChats()
      }
    } catch (error) {
      console.error('Failed to rename chat:', error)
    }
  }

  const handleDeleteChat = async (chatId) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        loadChats()
        if (currentChatId === chatId) {
          setCurrentChatId(null)
          setMessages([])
          setChatSummary('')
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-chat-bg'>
        <Loader2 className='animate-spin text-user-bubble' size={32} />
      </div>
    )
  }

  if (!session) {
    return null
  }



  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return

    const userMessage = {
      id: uuidv4(),
      text: messageText,
      type: 'user',
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage('')

    setIsLoadingGemini(true)
    let geminiResponseText =
      'Oh, sweetie, something went wrong. Can you tell me that again? 😢'

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: messageText, 
          persona: currentPersona,
          chatSummary 
        }),
      })

      const data = await response.json()
      if (data.error) {
        console.error('Gemini API Error:', data.error)
        geminiResponseText = `Oops! Gemini said: ${data.error}`
      } else {
        geminiResponseText =
          data.candidates?.[0]?.content?.parts?.[0]?.text || geminiResponseText
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error)
      geminiResponseText =
        "Oh no, darling! I couldn't reach my brain. 💔 Please try again!"
    } finally {
      setIsLoadingGemini(false)
      const aiMessage = {
        id: uuidv4(),
        text: geminiResponseText,
        type: 'ai',
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      }
      const finalMessages = [...newMessages, aiMessage]
      setMessages(finalMessages)
      
      // Handle first message: generate title and create chat
      let chatId = currentChatId
      if (!chatId && finalMessages.length === 2) {
        try {
          // Generate title first
          const titleResponse = await fetch('/api/generate-title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userMessage: messageText, 
              aiResponse: geminiResponseText 
            })
          })
          
          let generatedTitle = 'New Chat'
          if (titleResponse.ok) {
            const titleData = await titleResponse.json()
            generatedTitle = titleData.title || 'New Chat'
          }
          
          // Now create chat with the generated title
          const createResponse = await fetch('/api/chats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              persona: currentPersona,
              title: generatedTitle,
              messages: finalMessages
            })
          })
          
          if (createResponse.ok) {
            const newChat = await createResponse.json()
            chatId = newChat._id
            setCurrentChatId(chatId)
            loadChats()
          }
        } catch (error) {
          console.error('Failed to create chat with title:', error)
        }
      } else if (chatId) {
        // Save chat and update summary periodically for existing chats
        if (finalMessages.length % 6 === 0) {
          const summary = await summarizeChat(finalMessages)
          setChatSummary(summary)
          saveChat(finalMessages, summary, chatId)
        } else {
          saveChat(finalMessages, chatSummary, chatId)
        }
      }
    }
  }

  const handleTextInputChange = (e) => {
    setInputMessage(e.target.value)
  }

  const handleSendButtonClick = () => {
    sendMessage(inputMessage)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputMessage)
    }
  }

  return (
    <main className='relative flex h-screen overflow-hidden bg-chat-bg'>
      {/* Background Gradient & Blob Animations */}
      <div className='absolute inset-0 z-0 overflow-hidden pointer-events-none'>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className='absolute top-1/4 left-1/4 w-96 h-96 bg-user-bubble rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[--animation-blob]'
        ></motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className='absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent-secondary rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[--animation-blob] animation-delay-2000'
        ></motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-accent-primary rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-[--animation-blob] animation-delay-4000'
        ></motion.div>
      </div>

      {/* Desktop Sidebar */}
      <div className='hidden md:flex w-80 flex-col border-r border-white/5 bg-chat-bg-dark/50 backdrop-blur-xl z-20'>
        <ChatHistory
          chats={chats}
          currentChatId={currentChatId}
          onChatSelect={loadChat}
          onNewChat={createNewChat}
          isOpen={true}
          isSidebar={true}
          onRename={handleRenameChat}
          onDelete={handleDeleteChat}
        />
      </div>

      {/* Main Chat Interface */}
      <div className='flex-1 flex flex-col relative z-10 h-full'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 bg-chat-bg-dark/80 backdrop-blur-md border-b border-white/5 text-text-primary shadow-sm z-20'>
          <button 
            onClick={() => setShowChatHistory(true)}
            className='md:hidden text-[--color-icon-light] hover:text-white transition-colors'
          >
            <MessageCircle size={24} />
          </button>
          <div className='flex-1 text-center'>
            <button 
              onClick={() => setShowPersonaSelector(true)}
              className='flex items-center justify-center space-x-2 mx-auto hover:opacity-80 transition-opacity'
            >
              <span className='text-xl'>{personas[currentPersona]?.avatar}</span>
              <div>
                <h2 className='text-lg font-semibold'>{personas[currentPersona]?.name}</h2>
                <p className='text-xs text-[--color-text-secondary]'>Active now</p>
              </div>
            </button>
          </div>
          <div className='flex items-center gap-3'>
            <button onClick={() => router.push('/profile')} className='text-[--color-icon-light] hover:text-white transition-colors'>
              <Settings size={24} />
            </button>
            <button onClick={() => signOut()} className='text-[--color-icon-light] hover:text-white transition-colors'>
              <LogOut size={24} />
            </button>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div
          ref={chatContainerRef}
          className='flex-1 flex flex-col overflow-y-auto w-full px-4 py-3 custom-scrollbar bg-transparent'
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg.text}
                type={msg.type}
                timestamp={msg.timestamp}
              />
            ))}
            {isLoadingGemini && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className='self-start my-2'
              >
                <TypingDots />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className='flex items-center p-4 bg-chat-bg-dark/80 backdrop-blur-md border-t border-white/5 z-20'>
          <button className='text-[--color-icon-light] hover:text-white mr-3 transition-colors'>
            <Paperclip size={24} />
          </button>
          <div className='flex-1 relative'>
            <input
              type='text'
              value={inputMessage}
              onChange={handleTextInputChange}
              onKeyDown={handleKeyPress}
              placeholder='Type a message...'
              className='w-full bg-white/5 text-text-primary placeholder-text-placeholder rounded-full px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-user-bubble/50 transition-all border border-white/10'
            />
            <button className='absolute right-3 top-1/2 -translate-y-1/2 text-[--color-icon-light] hover:text-white transition-colors'>
              <Smile size={24} />
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendButtonClick}
            className='p-3 ml-3 bg-gradient-to-r from-user-bubble to-accent-secondary text-white rounded-full shadow-lg shadow-user-bubble/20 hover:shadow-user-bubble/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={!inputMessage.trim() || isLoadingGemini}
            aria-label='Send message'
          >
            {isLoadingGemini ? (
              <Loader2 size={20} className='animate-spin' />
            ) : (
              <Send size={20} />
            )}
          </motion.button>
        </div>
      </div>

      {/* Hidden Audio Player */}
      <audio ref={audioRef} className='hidden' />
      
      {/* Persona Selector Modal */}
      <AnimatePresence>
        {showPersonaSelector && (
          <PersonaSelector
            selectedPersona={currentPersona}
            onPersonaChange={setCurrentPersona}
            onClose={() => setShowPersonaSelector(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Mobile Chat History Modal */}
      <ChatHistory
        chats={chats}
        currentChatId={currentChatId}
        onChatSelect={loadChat}
        onNewChat={createNewChat}
        onClose={() => setShowChatHistory(false)}
        isOpen={showChatHistory}
        onRename={handleRenameChat}
        onDelete={handleDeleteChat}
      />
    </main>
  )
}
