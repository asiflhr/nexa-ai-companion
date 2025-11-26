import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import dbConnect from '@/lib/mongodb'
import Companion from '@/models/Companion'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET single companion
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await dbConnect()
  const companion = await Companion.findOne({ 
    _id: params.id, 
    userId: session.user.id 
  })

  if (!companion) {
    return NextResponse.json({ error: 'Companion not found' }, { status: 404 })
  }

  return NextResponse.json(companion)
}

// PUT update companion
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { name, gender, avatar, color, description, personalityTraits, systemPrompt, embedding } = data

    await dbConnect()
    
    const updateData = { updatedAt: new Date() }
    if (name) updateData.name = name
    if (gender) updateData.gender = gender
    if (avatar) updateData.avatar = avatar
    if (color) updateData.color = color
    if (description !== undefined) updateData.description = description
    if (personalityTraits) updateData.personalityTraits = personalityTraits
    if (systemPrompt) updateData.systemPrompt = systemPrompt
    if (embedding) updateData.embedding = embedding

    const companion = await Companion.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      updateData,
      { new: true }
    )

    if (!companion) {
      return NextResponse.json({ error: 'Companion not found' }, { status: 404 })
    }

    return NextResponse.json(companion)
  } catch (error) {
    console.error('Error updating companion:', error)
    return NextResponse.json(
      { error: 'Failed to update companion', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE companion
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await dbConnect()
  const companion = await Companion.findOneAndDelete({ 
    _id: params.id, 
    userId: session.user.id 
  })

  if (!companion) {
    return NextResponse.json({ error: 'Companion not found' }, { status: 404 })
  }

  return NextResponse.json({ message: 'Companion deleted successfully' })
}
