import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, gender, personalityTraits } = await req.json()

    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY not configured' },
        { status: 500 }
      )
    }

    // Build trait description
    const traitDescriptions = personalityTraits.map(trait => 
      `${trait.name}: ${trait.value}%`
    ).join(', ')

    const prompt = `Create a compelling personality description for an AI companion with the following characteristics:

Name: ${name}
Gender: ${gender}
Personality Traits: ${traitDescriptions}

Generate a 2-3 sentence description that captures their unique personality based on these traits. Make it engaging and conversational. Only return the description, nothing else.`

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
        { error: 'Failed to generate description', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

    return NextResponse.json({ description })
  } catch (error) {
    console.error('Error generating personality:', error)
    return NextResponse.json(
      { error: 'Failed to generate personality', details: error.message },
      { status: 500 }
    )
  }
}
