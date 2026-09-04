import { NextResponse } from 'next/server'
import { getDb, saveDb, UserRecord } from '@/lib/db'
import { hashPassword, generateSalt, createSessionToken } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { name, email, password, confirmPassword } = await req.json()

    // 1. Required fields check
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Full Name, email, and password are required' }, { status: 400 })
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    // 3. Password length check
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 })
    }

    // 4. Password match check
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json({ error: 'Password and Confirm Password do not match' }, { status: 400 })
    }

    // 5. Duplicate email check
    const db = getDb()
    const existingUser = db.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email address already exists. Please sign in instead.' }, { status: 400 })
    }

    // 6. Secure Password Hashing
    const salt = generateSalt()
    const passwordHash = hashPassword(password, salt)
    const userId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`

    const newUser: UserRecord = {
      id: userId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      salt,
      memberSince: new Date().getFullYear().toString(),
      createdAt: new Date().toISOString(),
      hasData: false,
      occupation: 'Kirana Shop',
      language: 'en',
      uploadedFileName: null,
      uploadedAt: null,
      scoringResult: null
    }

    db.users.push(newUser)
    db.advisor_chats[userId] = [
      {
        id: `msg_${Date.now()}`,
        userId,
        sender: 'ai',
        text: `Namaste ${name.trim()}! Welcome to Credora. Upload your 90-day transaction CSV or link a bank account via RBI Account Aggregator to calculate your cash-flow credit score!`,
        timestamp: 'Just now'
      }
    ]
    saveDb(db)

    const token = createSessionToken(newUser.id, newUser.email, newUser.name)

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        memberSince: newUser.memberSince,
        plan: 'Pro Cash Flow'
      }
    })

    response.cookies.set('credora_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })

    return response
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Signup failed' }, { status: 500 })
  }
}
