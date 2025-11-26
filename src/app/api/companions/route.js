import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import Companion from '@/models/Companion'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET all companions for the user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await dbConnect()
  const companions = await Companion.find({ userId: session.user.id })
    .sort({ createdAt: -1 })

  return NextResponse.json(companions)
}

// POST create new companion
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { name, gender, avatar, color, description, personalityTraits, systemPrompt, embedding } = data

    await dbConnect()
    const companion = await Companion.create({
      userId: session.user.id,
      name,
      gender,
      avatar,
      color,
      description,
      personalityTraits,
      systemPrompt,
      embedding: embedding || [],
      isCustom: true
    })

    return NextResponse.json(companion)
  } catch (error) {
    console.error('Error creating companion:', error)
    return NextResponse.json(
      { error: 'Failed to create companion', details: error.message },
      { status: 500 }
    )
  }
}
