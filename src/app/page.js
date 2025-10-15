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

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona: currentPersona })
      })
      if (response.ok) {
        const newChat = await response.json()
        setCurrentChatId(newChat._id)
        setMessages([])
        setChatSummary('')
        loadChats()
      }
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
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

  const saveChat = async (newMessages, summary = chatSummary) => {
    if (!currentChatId) return
    
    try {
      await fetch(`/api/chats/${currentChatId}`, {
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

  if (status === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[--color-chat-bg]'>
        <Loader2 className='animate-spin text-[--color-user-bubble]' size={32} />
      </div>
    )
  }

  if (!session) {
    return null
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return

    // Create new chat if none exists
    if (!currentChatId) {
      await createNewChat()
    }

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
      
      // Save chat and update summary periodically
      if (finalMessages.length % 6 === 0) {
        const summary = await summarizeChat(finalMessages)
        setChatSummary(summary)
        saveChat(finalMessages, summary)
      } else {
        saveChat(finalMessages)
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
    <main className='relative flex flex-col items-center justify-between min-h-screen p-4 overflow-hidden'>
      {/* Background Gradient & Blob Animations (kept from previous design, adapt colors) */}
      <div className='absolute inset-0 z-0 overflow-hidden'>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className='absolute top-1/4 left-1/4 w-96 h-96 bg-accent-orange rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-[--animation-blob]'
        ></motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className='absolute bottom-1/3 right-1/4 w-80 h-80 bg-[--color-accent-orange-dark] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-[--animation-blob] animation-delay-2000'
        ></motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[--color-ai-bubble] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-[--animation-blob] animation-delay-4000'
        ></motion.div>
      </div>

      {/* Main Chat Interface - Phone Mockup (using a simple styled div for now) */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
        className='relative z-10 w-full max-w-sm md:max-w-lg lg:max-w-xl h-[90vh] bg-[--color-chat-bg-dark] rounded-3xl shadow-2xl overflow-hidden
                   border-[10px] border-black ring-[1px] ring-gray-700
                   flex flex-col' // Added flex-col for internal layout
      >
        {/* Header */}
        <div className='flex items-center justify-between p-4 bg-[--color-ai-bubble] border-b border-[--color-border-subtle] text-ai-bubble'>
          <button onClick={() => setShowChatHistory(true)}>
            <MessageCircle size={24} className='text-[--color-icon-light]' />
          </button>
          <div className='flex-1 text-center'>
            <button 
              onClick={() => setShowPersonaSelector(true)}
              className='flex items-center justify-center space-x-2 mx-auto'
            >
              <span className='text-xl'>{personas[currentPersona]?.avatar}</span>
              <div>
                <h2 className='text-lg font-semibold'>{personas[currentPersona]?.name}</h2>
                <p className='text-xs text-[--color-text-secondary]'>Active now</p>
              </div>
            </button>
          </div>
          <button onClick={() => signOut()}>
            <LogOut size={24} className='text-[--color-icon-light]' />
          </button>
        </div>

        {/* Chat Messages Container */}
        <div
          ref={chatContainerRef}
          className='flex-1 flex flex-col overflow-y-auto w-full px-4 py-3 custom-scrollbar bg-[--color-chat-bg]'
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
        <div className='flex items-center p-3 bg-[--color-chat-bg-dark] border-t border-[--color-border-subtle]'>
          <Paperclip
            size={24}
            className='text-[--color-icon-light] mr-2 cursor-pointer'
          />
          <input
            type='text'
            value={inputMessage}
            onChange={handleTextInputChange}
            onKeyDown={handleKeyPress}
            placeholder='Type message...'
            className='flex-1 bg-transparent text-[--color-text-primary] placeholder-[--color-text-placeholder] border-none outline-none text-base px-2 py-2'
          />
          <Smile
            size={24}
            className='text-[--color-icon-light] ml-2 cursor-pointer'
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendButtonClick}
            className='p-2 ml-2 bg-user-bubble text-[--color-text-primary] rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={!inputMessage.trim() || isLoadingGemini}
            aria-label='Send message'
            title='Send message'
          >
            {isLoadingGemini ? (
              <Loader2 size={20} className='animate-spin' />
            ) : (
              <Send size={20} />
            )}
          </motion.button>
        </div>
      </motion.div>

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
      
      {/* Chat History Modal */}
      <ChatHistory
        chats={chats}
        onChatSelect={loadChat}
        onNewChat={createNewChat}
        onClose={() => setShowChatHistory(false)}
        isOpen={showChatHistory}
      />
    </main>
  )
}
