import { Language } from './types'

export type IntentCategory =
  | 'SCORE_WHY_LOW'
  | 'SCORE_IMPROVE'
  | 'SPENDING_ANALYSIS'
  | 'RISK_ANALYSIS'
  | 'ANOMALY_QUERY'
  | 'FINANCIAL_SUMMARY'
  | 'EMI_DEBT'
  | 'CREDIT_BASICS'
  | 'GENERAL_GUIDANCE'

export interface LanguageAndIntentDetection {
  detectedLanguage: Language
  detectedIntent: IntentCategory
  isTransliterated: boolean
  dialect?: 'tanglish' | 'hinglish' | 'standard'
}

/**
 * Detect language script or Romanized dialect (Tanglish / Hinglish) and financial intent.
 */
export function detectLanguageAndIntent(
  text: string,
  preferredLanguage: Language = 'en'
): LanguageAndIntentDetection {
  const query = (text || '').trim().toLowerCase()

  // 1. Script-based language detection
  const hasTamilScript = /[\u0B80-\u0BFF]/.test(query)
  const hasDevanagariScript = /[\u0900-\u097F]/.test(query)

  let detectedLanguage: Language = preferredLanguage
  let dialect: 'tanglish' | 'hinglish' | 'standard' = 'standard'
  let isTransliterated = false

  if (hasTamilScript) {
    detectedLanguage = 'ta'
  } else if (hasDevanagariScript) {
    // Distinguish Marathi vs Hindi script markers if possible, default to preferred or Marathi/Hindi
    if (query.includes('आहे') || query.includes('कसा') || query.includes('माझा') || query.includes('करा') || preferredLanguage === 'mr') {
      detectedLanguage = 'mr'
    } else if (preferredLanguage === 'hi') {
      detectedLanguage = 'hi'
    } else {
      detectedLanguage = 'hi'
    }
  } else {
    // Romanized / Transliterated text check
    const tanglishKeywords = ['machan', 'yen', 'yenna', 'kammi', 'iruku', 'irukku', 'pannanum', 'epadi', 'epdi', 'seri', 'illai', 'varum', 'scoreu']
    const hinglishKeywords = ['mera', 'meri', 'kyu', 'kyun', 'kya', 'kaise', 'itna', 'hai', 'batao', 'kam', 'karo', 'chahiye', 'kaunsa']
    const marathiRomanKeywords = ['maza', 'mazi', 'kasa', 'kashi', 'kasa', 'kiti', 'aahe', 'mala']

    const isTanglish = tanglishKeywords.some(k => query.includes(k))
    const isHinglish = hinglishKeywords.some(k => query.includes(k))
    const isMarathiRoman = marathiRomanKeywords.some(k => query.includes(k))

    if (isTanglish) {
      detectedLanguage = 'ta'
      dialect = 'tanglish'
      isTransliterated = true
    } else if (isMarathiRoman) {
      detectedLanguage = 'mr'
      isTransliterated = true
    } else if (isHinglish) {
      detectedLanguage = 'hi'
      dialect = 'hinglish'
      isTransliterated = true
    }
  }

  // 2. Intent Categorization
  let detectedIntent: IntentCategory = 'GENERAL_GUIDANCE'

  // Score Low / Why
  if (
    query.includes('low') ||
    query.includes('kammi') ||
    query.includes('कम') ||
    query.includes('குறை') ||
    query.includes('कमी') ||
    query.includes('down') ||
    query.includes('drop') ||
    query.includes('why') ||
    query.includes('reason') ||
    query.includes('yen') ||
    query.includes('kyu') ||
    query.includes('कारण')
  ) {
    if (query.includes('improve') || query.includes('increase') || query.includes('grow') || query.includes('pannanum') || query.includes('karo') || query.includes('कसा')) {
      detectedIntent = 'SCORE_IMPROVE'
    } else {
      detectedIntent = 'SCORE_WHY_LOW'
    }
  }
  // Score Improve
  else if (
    query.includes('improve') ||
    query.includes('increase') ||
    query.includes('boost') ||
    query.includes('raise') ||
    query.includes('780') ||
    query.includes('800') ||
    query.includes('உயர்த்த') ||
    query.includes('सुधार') ||
    query.includes('वाढवा') ||
    query.includes('pannanum') ||
    query.includes('karo')
  ) {
    detectedIntent = 'SCORE_IMPROVE'
  }
  // Spending Analysis
  else if (
    query.includes('spend') ||
    query.includes('expense') ||
    query.includes('outflow') ||
    query.includes('selavu') ||
    query.includes('செலவு') ||
    query.includes('खर्च') ||
    query.includes('kharch') ||
    query.includes('grocery') ||
    query.includes('shopping')
  ) {
    detectedIntent = 'SPENDING_ANALYSIS'
  }
  // Risk Analysis
  else if (
    query.includes('risk') ||
    query.includes('danger') ||
    query.includes('safe') ||
    query.includes('abaththam') ||
    query.includes('ஆபத்து') ||
    query.includes('जोखिम') ||
    query.includes('धोका')
  ) {
    detectedIntent = 'RISK_ANALYSIS'
  }
  // Anomaly / Suspicious
  else if (
    query.includes('unusual') ||
    query.includes('spike') ||
    query.includes('anomaly') ||
    query.includes('suspicious') ||
    query.includes('fraud') ||
    query.includes('விசித்திர') ||
    query.includes('असामान्य')
  ) {
    detectedIntent = 'ANOMALY_QUERY'
  }
  // Summary / Overall
  else if (
    query.includes('summary') ||
    query.includes('health') ||
    query.includes('overall') ||
    query.includes('report') ||
    query.includes('overview') ||
    query.includes('சுருக்கம்') ||
    query.includes('सारांश') ||
    query.includes('स्थिती')
  ) {
    detectedIntent = 'FINANCIAL_SUMMARY'
  }
  // EMI & Debt
  else if (
    query.includes('emi') ||
    query.includes('loan') ||
    query.includes('debt') ||
    query.includes('repay') ||
    query.includes('kadan') ||
    query.includes('கடன்') ||
    query.includes('ऋण') ||
    query.includes('कर्ज')
  ) {
    detectedIntent = 'EMI_DEBT'
  }
  // Credit Basics
  else if (
    query.includes('what is credit score') ||
    query.includes('explain credit') ||
    query.includes('how credit works') ||
    query.includes('cibil vs credora')
  ) {
    detectedIntent = 'CREDIT_BASICS'
  }

  return {
    detectedLanguage,
    detectedIntent,
    isTransliterated,
    dialect
  }
}
