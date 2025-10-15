'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        name,
        isSignUp: isSignUp.toString(),
        redirect: false,
      })

      if (result?.ok) {
        router.push('/')
      } else {
        alert(result?.error || 'Authentication failed')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='min-h-screen flex items-center justify-center bg-[--color-chat-bg] p-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-[--color-chat-bg-dark] p-8 rounded-2xl shadow-2xl w-full max-w-md'
      >
        <h1 className='text-2xl font-bold text-center mb-6 text-[--color-text-primary]'>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <input
              type='email'
              placeholder='Email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className='w-full p-3 bg-[--color-ai-bubble] text-[--color-text-primary] rounded-lg border border-[--color-border-subtle] focus:outline-none focus:border-[--color-user-bubble]'
            />
          </div>

          {isSignUp && (
            <div>
              <input
                type='text'
                placeholder='Name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className='w-full p-3 bg-[--color-ai-bubble] text-[--color-text-primary] rounded-lg border border-[--color-border-subtle] focus:outline-none focus:border-[--color-user-bubble]'
              />
            </div>
          )}

          <button
            type='submit'
            disabled={loading}
            className='w-full p-3 bg-[--color-user-bubble] text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50'
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p className='text-center mt-4 text-[--color-text-secondary]'>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className='text-[--color-user-bubble] hover:underline'
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </motion.div>
    </main>
  )
}