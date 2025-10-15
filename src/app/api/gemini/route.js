// app/api/gemini/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getPersonaPrompt } from '@/lib/personas'

export async function POST(req) {
  try {
    const { text, persona = 'niko', chatSummary = '' } = await req.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const systemPrompt = getPersonaPrompt(persona, chatSummary)

    const body = {
      system_instruction: {
        parts: [
          {
            text: systemPrompt,
          },
        ],
      },
      contents: [
        {
          parts: [{ text: text }],
        },
      ],
    }

    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not set' },
        { status: 500 }
      )
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
        { error: 'Failed to get response from Gemini API', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
