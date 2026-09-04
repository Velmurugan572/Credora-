import fs from 'fs'
import path from 'path'
import { ScoringEngineOutput, Occupation, Language } from './types'

export interface UserRecord {
  id: string
  name: string
  email: string
  passwordHash: string
  salt: string
  memberSince: string
  createdAt: string
  hasData: boolean
  occupation: Occupation
  language: Language
  uploadedFileName: string | null
  uploadedAt: string | null
  scoringResult: ScoringEngineOutput | null
}

export interface BankAccountRecord {
  id: string
  userId: string
  name: string
  type: string
  balance: string
  numericBalance: number
  status: string
  lastSynced: string
  plaidId: string
  active: boolean
}

export interface SimulationRecord {
  userId: string
  savingsContribution: number
  expenseVariance: number
  debtAllocation: number
  projectedScore: number
  pointsGained: number
  updatedAt: string
}

export interface AdvisorMessageRecord {
  id: string
  userId: string
  sender: 'ai' | 'user'
  text: string
  timestamp: string
}

export interface DatabaseSchema {
  users: UserRecord[]
  accounts: BankAccountRecord[]
  simulations: Record<string, SimulationRecord>
  advisor_chats: Record<string, AdvisorMessageRecord[]>
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

const DEFAULT_USER_ID = 'usr_jordan_davis_01'
const DEFAULT_DEMO_USER: UserRecord = {
  id: DEFAULT_USER_ID,
  name: 'Jordan Davis',
  email: 'jordan.davis@example.com',
  passwordHash: 'f4bcb8897caa7fba3b0759d305d074008717be0315ba49dbeaea40748e31713d',
  salt: 'demo_salt_credora',
  memberSince: '2024',
  createdAt: new Date().toISOString(),
  hasData: false, // Default to FALSE to enforce single source of truth onboarding state until CSV upload/bank link!
  occupation: 'Kirana Shop',
  language: 'en',
  uploadedFileName: null,
  uploadedAt: null,
  scoringResult: null
}

const INITIAL_DB: DatabaseSchema = {
  users: [DEFAULT_DEMO_USER],
  accounts: [], // 0 accounts linked by default
  simulations: {},
  advisor_chats: {}
}

function ensureDbExists(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8')
      return INITIAL_DB
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8')
    const parsed = JSON.parse(content)
    return parsed
  } catch (err) {
    console.error('Error loading DB file:', err)
    return INITIAL_DB
  }
}

export function getDb(): DatabaseSchema {
  return ensureDbExists()
}

export function saveDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    // Atomic write pattern: write to tmp file then rename
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8')
    fs.renameSync(tmpFile, DB_FILE)
  } catch (err) {
    console.error('Error saving DB file:', err)
  }
}

export function getUserRecord(userId: string): UserRecord | null {
  const db = getDb()
  return db.users.find(u => u.id === userId) || null
}

export function updateUserScoring(
  userId: string,
  scoringResult: ScoringEngineOutput,
  occupation: Occupation,
  uploadedFileName?: string,
  name?: string
): UserRecord {
  const db = getDb()
  let user = db.users.find(u => u.id === userId)

  if (!user) {
    user = {
      id: userId,
      name: name?.trim() || 'User',
      email: `${userId}@credora.in`,
      passwordHash: '',
      salt: '',
      memberSince: new Date().getFullYear().toString(),
      createdAt: new Date().toISOString(),
      hasData: true,
      occupation,
      language: 'en',
      uploadedFileName: uploadedFileName || 'uploaded_transactions.csv',
      uploadedAt: new Date().toISOString(),
      scoringResult
    }
    db.users.push(user)
  } else {
    if (name?.trim()) {
      user.name = name.trim()
    }
    user.hasData = true
    user.occupation = occupation
    user.scoringResult = scoringResult
    if (uploadedFileName) {
      user.uploadedFileName = uploadedFileName
      user.uploadedAt = new Date().toISOString()
    }
  }

  saveDb(db)
  return user
}

export function updateUserLanguage(userId: string, language: Language): void {
  const db = getDb()
  const user = db.users.find(u => u.id === userId)
  if (user) {
    user.language = language
    saveDb(db)
  }
}
