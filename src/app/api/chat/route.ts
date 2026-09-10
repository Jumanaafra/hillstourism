import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { generateChatbotReply } from '@/lib/services/gemini.service'

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'
    const rateCheck = checkRateLimit(`chat_${ip}`, { intervalMs: 60000, maxRequests: 12 })
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: "You're sending questions too quickly. Please pause a moment.",
          },
        },
        { status: 429 }
      )
    }

    let body: any
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'Invalid request payload.',
          },
        },
        { status: 400 }
      )
    }

    const message = body?.message
    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Please provide a non-empty message.',
          },
        },
        { status: 400 }
      )
    }

    if (message.length > 800) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Message exceeds maximum length of 800 characters.',
          },
        },
        { status: 400 }
      )
    }

    const history = Array.isArray(body?.history) ? body.history.slice(-10) : []

    // Conversation length limit (spec §39)
    if (Array.isArray(body?.history) && body.history.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONVERSATION_LIMIT',
            message: 'Conversation is too long. Please start a new chat.',
          },
        },
        { status: 400 }
      )
    }

    const response = await generateChatbotReply(message.trim(), history)

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (err: any) {
    console.error('[Chat API] Internal chat failure:', err)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CHAT_ERROR',
          message: "HillGuide is temporarily resting. Please try again or feel free to message us on WhatsApp!",
        },
      },
      { status: 500 }
    )
  }
}
