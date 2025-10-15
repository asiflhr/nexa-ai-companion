import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { messages } = await req.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ summary: '' })
    }

    const conversationText = messages
      .map(msg => `${msg.type}: ${msg.text}`)
      .join('\n')

    const body = {
      system_instruction: {
        parts: [{
          text: `Summarize this conversation in 2-3 sentences, focusing on key topics, emotions, and context that would be helpful for continuing the conversation later. Be concise but capture the essence of the interaction.`
        }]
      },
      contents: [{
        parts: [{ text: conversationText }]
      }]
    }

    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!API_KEY) {
      return NextResponse.json({ error: 'API key not set' }, { status: 500 })
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
      throw new Error('Failed to summarize')
    }

    const data = await response.json()
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Summarization error:', error)
    return NextResponse.json({ summary: '' })
  }
}