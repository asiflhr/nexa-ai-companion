import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userMessage, aiResponse } = await req.json()

    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      )
    }

    const prompt = `Based on this conversation, generate a short, concise title (maximum 4-5 words) that captures the main topic or question. Only return the title, nothing else.

User: ${userMessage}
AI: ${aiResponse}

Title:`

    const body = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API Error:', errorData)
      return NextResponse.json(
        { error: 'Failed to generate title', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const title = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().replace(/^["']|["']$/g, '') || 'New Chat'

    return NextResponse.json({ title })
  } catch (error) {
    console.error('Error generating title:', error)
    return NextResponse.json(
      { error: 'Failed to generate title', details: error.message },
      { status: 500 }
    )
  }
}
