import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import Chat from '@/models/Chat'

export async function GET(req, { params }) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await dbConnect()
  const chat = await Chat.findOne({ 
    _id: params.id, 
    userId: session.user.id 
  })

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  }

  return NextResponse.json(chat)
}

export async function PUT(req, { params }) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { messages, summary } = await req.json()
  
  await dbConnect()
  const chat = await Chat.findOneAndUpdate(
    { _id: params.id, userId: session.user.id },
    { 
      messages, 
      summary,
      lastActivity: new Date() 
    },
    { new: true }
  )

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  }

  return NextResponse.json(chat)
}