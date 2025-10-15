import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        name: { label: 'Name', type: 'text' },
        isSignUp: { label: 'Is Sign Up', type: 'boolean' }
      },
      async authorize(credentials) {
        await dbConnect()
        
        const { email, name, isSignUp } = credentials
        
        if (isSignUp === 'true') {
          // Sign up
          const existingUser = await User.findOne({ email })
          if (existingUser) {
            throw new Error('User already exists')
          }
          
          const user = await User.create({ email, name })
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          }
        } else {
          // Sign in
          const user = await User.findOne({ email })
          if (!user) {
            throw new Error('No user found')
          }
          
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          }
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
})

export { handler as GET, handler as POST }