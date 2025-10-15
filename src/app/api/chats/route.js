import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import Chat from '@/models/Chat'

export async function GET() {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await dbConnect()
  const chats = await Chat.find({ userId: session.user.id })
    .sort({ lastActivity: -1 })
    .select('title persona lastActivity createdAt')

  return NextResponse.json(chats)
}

export async function POST(req) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, persona } = await req.json()
  
  await dbConnect()
  const chat = await Chat.create({
    userId: session.user.id,
    title: title || 'New Chat',
    persona: persona || 'niko',
    messages: [],
  })

  return NextResponse.json(chat)
}