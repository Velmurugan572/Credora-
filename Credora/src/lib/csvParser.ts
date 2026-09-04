import { TransactionRecord } from './types'

export interface CSVParseResult {
  success: boolean
  transactions: TransactionRecord[]
  error?: string
  rowCount?: number
  dateRange?: { start: string; end: string; days: number }
}

/**
 * Validates and parses 90-day transaction CSV files.
 * Supported headers:
 * - date (YYYY-MM-DD or DD/MM/YYYY)
 * - amount OR credit & debit
 * - direction (credit/debit - optional if signed amount or separate columns)
 * - counterparty / description
 * - runningBalance / balance (optional)
 */
export function parseTransactionCSV(csvText: string): CSVParseResult {
  if (!csvText || !csvText.trim()) {
    return { success: false, transactions: [], error: 'The uploaded file is empty. Please provide a valid 90-day transaction CSV.' }
  }

  const lines = csvText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)

  if (lines.length < 2) {
    return { success: false, transactions: [], error: 'CSV file must contain a header row and at least 5 transaction rows.' }
  }

  const headerLine = lines[0].toLowerCase()
  const headers = parseCSVLine(headerLine)

  // Identify column indices
  const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('txn_date') || h.includes('timestamp'))
  const amountIdx = headers.findIndex(h => h === 'amount' || h.includes('transaction_amount') || h.includes('value'))
  const creditIdx = headers.findIndex(h => h.includes('credit') || h.includes('deposit') || h.includes('inflow'))
  const debitIdx = headers.findIndex(h => h.includes('debit') || h.includes('withdrawal') || h.includes('outflow'))
  const dirIdx = headers.findIndex(h => h.includes('direction') || h.includes('type') || h.includes('cr_dr'))
  const descIdx = headers.findIndex(h => h.includes('description') || h.includes('counterparty') || h.includes('narration') || h.includes('remarks') || h.includes('payee') || h.includes('name'))
  const balanceIdx = headers.findIndex(h => h.includes('balance') || h.includes('running_balance'))

  if (dateIdx === -1) {
    return { success: false, transactions: [], error: 'Missing required column: "date" (e.g., YYYY-MM-DD or DD-MM-YYYY).' }
  }

  if (amountIdx === -1 && creditIdx === -1 && debitIdx === -1) {
    return { success: false, transactions: [], error: 'Missing required column for transaction values: expected "amount", "credit", or "debit".' }
  }

  const rawTransactions: TransactionRecord[] = []

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])
    if (row.length < Math.max(dateIdx, amountIdx, descIdx) + 1) continue

    const rawDate = row[dateIdx]?.trim()
    const formattedDate = parseDateString(rawDate)
    if (!formattedDate) continue

    let amount = 0
    let direction: 'credit' | 'debit' = 'credit'

    if (amountIdx !== -1) {
      const valStr = row[amountIdx]?.replace(/[^0-9.-]/g, '') || '0'
      const val = parseFloat(valStr)
      if (isNaN(val)) continue

      if (dirIdx !== -1) {
        const dirStr = row[dirIdx]?.toLowerCase() || ''
        if (dirStr.includes('dr') || dirStr.includes('debit') || dirStr.includes('out')) {
          direction = 'debit'
          amount = Math.abs(val)
        } else {
          direction = 'credit'
          amount = Math.abs(val)
        }
      } else {
        if (val < 0) {
          direction = 'debit'
          amount = Math.abs(val)
        } else {
          direction = 'credit'
          amount = Math.abs(val)
        }
      }
    } else {
      const creditValStr = creditIdx !== -1 ? row[creditIdx]?.replace(/[^0-9.]/g, '') : ''
      const debitValStr = debitIdx !== -1 ? row[debitIdx]?.replace(/[^0-9.]/g, '') : ''

      const creditVal = parseFloat(creditValStr || '0')
      const debitVal = parseFloat(debitValStr || '0')

      if (creditVal > 0) {
        direction = 'credit'
        amount = creditVal
      } else if (debitVal > 0) {
        direction = 'debit'
        amount = debitVal
      } else {
        continue
      }
    }

    const description = descIdx !== -1 ? (row[descIdx]?.trim() || 'UPI / Transfer') : 'Transaction'
    const counterparty = extractCounterparty(description)

    let runningBalance: number | undefined = undefined
    if (balanceIdx !== -1) {
      const balStr = row[balanceIdx]?.replace(/[^0-9.-]/g, '') || ''
      const parsedBal = parseFloat(balStr)
      if (!isNaN(parsedBal)) runningBalance = parsedBal
    }

    rawTransactions.push({
      date: formattedDate,
      amount,
      direction,
      counterparty,
      description,
      runningBalance
    })
  }

  if (rawTransactions.length === 0) {
    return { success: false, transactions: [], error: 'Could not extract valid transaction rows from the CSV file. Check date and amount formats.' }
  }

  // Sort chronologically
  rawTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const startDate = rawTransactions[0].date
  const endDate = rawTransactions[rawTransactions.length - 1].date
  const timeDiff = new Date(endDate).getTime() - new Date(startDate).getTime()
  const daysDiff = Math.max(Math.ceil(timeDiff / (1000 * 3600 * 24)), 1)

  return {
    success: true,
    transactions: rawTransactions,
    rowCount: rawTransactions.length,
    dateRange: {
      start: startDate,
      end: endDate,
      days: daysDiff
    }
  }
}

function parseCSVLine(text: string): string[] {
  const result: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(cell.trim())
      cell = ''
    } else {
      cell += char
    }
  }
  result.push(cell.trim())
  return result
}

function parseDateString(rawDate: string): string | null {
  if (!rawDate) return null
  const cleaned = rawDate.replace(/\//g, '-').trim()

  // Matches YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned
  }

  // Matches DD-MM-YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0')
    const month = dmyMatch[2].padStart(2, '0')
    const year = dmyMatch[3]
    return `${year}-${month}-${day}`
  }

  // Standard JS Date parse fallback
  const d = new Date(rawDate)
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0]
  }

  return null
}

function extractCounterparty(desc: string): string {
  if (!desc) return 'UPI / Counterparty'
  // Common Indian UPI descriptions: UPI/P2A/938120/RAHUL TRADERS/HDFC...
  const upiParts = desc.split('/')
  if (upiParts.length >= 4) {
    return upiParts[3].trim()
  }
  return desc.slice(0, 30).trim()
}
