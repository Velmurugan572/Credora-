import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAuthenticatedUser } from '@/lib/auth'
import { getDb, saveDb, getUserRecord, updateUserLanguage, AdvisorMessageRecord } from '@/lib/db'
import { generateAIAdvisorExplanation } from '@/lib/aiAdvisor'
import { Language } from '@/lib/types'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('credora_token')?.value
    const authUser = token ? getAuthenticatedUser(token) : null
    const userId = authUser ? authUser.id : 'usr_jordan_davis_01'

    const db = getDb()
    const chatHistory = db.advisor_chats[userId] || []

    return NextResponse.json({
      success: true,
      messages: chatHistory
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('credora_token')?.value
    const authUser = token ? getAuthenticatedUser(token) : null
    const userId = authUser ? authUser.id : 'usr_jordan_davis_01'

    const body = await req.json()
    const text = body.text
    const requestLanguage = body.language as Language | undefined

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Message text required' }, { status: 400 })
    }

    const db = getDb()
    if (!db.advisor_chats[userId]) {
      db.advisor_chats[userId] = []
    }

    const userMsg: AdvisorMessageRecord = {
      id: `msg_${Date.now()}`,
      userId,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    db.advisor_chats[userId].push(userMsg)

    // Fetch user score data and language preference
    const userRecord = getUserRecord(userId)
    const scoringResult = userRecord?.hasData ? userRecord.scoringResult : null
    const targetLanguage: Language = requestLanguage || userRecord?.language || 'en'

    if (requestLanguage && userRecord && userRecord.language !== requestLanguage) {
      updateUserLanguage(userId, requestLanguage)
    }

    // Generate AI response strictly via explanation service boundary
    const aiReply = await generateAIAdvisorExplanation(scoringResult, text.trim(), targetLanguage)

    const aiMsg: AdvisorMessageRecord = {
      id: `msg_${Date.now() + 1}`,
      userId,
      sender: 'ai',
      text: aiReply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    db.advisor_chats[userId].push(aiMsg)
    saveDb(db)

    return NextResponse.json({
      success: true,
      messages: db.advisor_chats[userId]
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send message' }, { status: 500 })
  }
}
