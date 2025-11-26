// app/components/ChatBubble.js
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown' // Import ReactMarkdown
import remarkGfm from 'remark-gfm' // Import remarkGfm for GitHub Flavored Markdown

const ChatBubble = ({ message, type, timestamp }) => {
  const isUser = type === 'user'
  const bubbleClasses = isUser
    ? 'bg-gradient-to-br from-user-bubble to-accent-secondary text-white shadow-lg shadow-user-bubble/20 self-end rounded-t-2xl rounded-bl-2xl rounded-br-sm float-end'
    : 'bg-ai-bubble/80 backdrop-blur-sm border border-white/5 text-text-primary self-start rounded-t-2xl rounded-br-2xl rounded-bl-sm float-start shadow-md'

  // Define custom rendering for Markdown elements
  const markdownComponents = {
    // Style paragraphs
    p: ({ node, ...props }) => <p className='mb-2 last:mb-0' {...props} />,
    // Style headings (example for h2)
    h1: ({ node, ...props }) => (
      <h1 className='text-xl font-bold text-user-bubble mb-2 mt-4' {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2
        className='text-lg font-semibold text-text-primary mb-2 mt-3'
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3
        className='text-base font-medium text-text-primary mb-1 mt-2'
        {...props}
      />
    ),
    // Style lists
    ul: ({ node, ...props }) => (
      <ul className='list-disc list-inside mb-2 pl-4' {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className='list-decimal list-inside mb-2 pl-4' {...props} />
    ),
    li: ({ node, ...props }) => <li className='mb-1' {...props} />,
    // Style strong (bold) text
    strong: ({ node, ...props }) => (
      <strong className='font-bold text-user-bubble' {...props} />
    ),
    // Style emphasis (italic) text
    em: ({ node, ...props }) => (
      <em className='italic text-text-secondary' {...props} />
    ),
    // Style inline code
    code: ({ node, ...props }) => (
      <code
        className='bg-chat-bg-dark px-1 py-0.5 rounded text-sm text-user-bubble font-mono'
        {...props}
      />
    ),
    // Style code blocks (preformatted text)
    pre: ({ node, ...props }) => (
      <pre
        className='bg-chat-bg-dark p-3 rounded-lg overflow-x-auto my-3 text-sm'
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }} // Ensure wrapping
        {...props}
      />
    ),
    // Style blockquotes
    blockquote: ({ node, ...props }) => (
      <blockquote
        className='border-l-4 border-user-bubble pl-3 italic text-text-secondary my-3'
        {...props}
      />
    ),
    // Style links (optional)
    a: ({ node, ...props }) => (
      <a
        className='text-user-bubble hover:underline'
        target='_blank'
        rel='noopener noreferrer'
        {...props}
      />
    ),
  }

  return (
    <div className='w-full'>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`max-w-[80%] w-fit p-3 my-2 shadow-md ${bubbleClasses}`}
      >
        {/* Use ReactMarkdown to render the message content */}
        <ReactMarkdown
          // className='prose max-w-none' // 'prose' gives basic typography, 'max-w-none' removes max-width
          remarkPlugins={[remarkGfm]} // Add GitHub Flavored Markdown support
          components={markdownComponents}
        >
          {message}
        </ReactMarkdown>
        <div className='flex items-center justify-end text-xs text-text-primary mt-1'>
          {timestamp && <span className='mr-1'>{timestamp}</span>}
          {isUser && <Check size={14} />}
        </div>
      </motion.div>
    </div>
  )
}

export default ChatBubble
