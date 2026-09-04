import { ScoringEngineOutput, Language } from './types'
import { detectLanguageAndIntent, IntentCategory, LanguageAndIntentDetection } from './languageDetector'

/**
 * AI Advisor Service — Explanation Layer
 * - Accepts structured ScoringEngineOutput JSON, user query, and language.
 * - Detects language scripts and transliterated dialects (Tanglish, Hinglish).
 * - Generates context-aware, highly personalized responses tailored to user data.
 * - Supports English, Tamil, Hindi, and Marathi natively.
 * - Preserves Credora's natural, supportive, conversational response style.
 * - Enforces post-response sanitization to prevent numerical score hallucinations.
 */
export async function generateAIAdvisorExplanation(
  scoringOutput: ScoringEngineOutput | null,
  userQuery?: string,
  language: Language = 'en'
): Promise<string> {
  const queryText = (userQuery || '').trim()

  // 1. Detect language script, transliterated dialect, and query intent
  const detection = detectLanguageAndIntent(queryText, language)
  const targetLang = detection.detectedLanguage

  // Guard for onboarding / empty state users (0 score)
  if (!scoringOutput || scoringOutput.score === 0) {
    return generateOnboardingAdvice(targetLang)
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY
  let rawExplanation = ''

  // 2. Call LLM API if key is present & enabled
  if (apiKey && process.env.ENABLE_LLM_CALLS === 'true') {
    try {
      rawExplanation = await callLLMAdvisorAPI(scoringOutput, queryText, targetLang, detection, apiKey)
    } catch (err) {
      console.error('LLM API call failed, using multilingual explanation engine:', err)
      rawExplanation = generateMultilingualResponse(scoringOutput, queryText, targetLang, detection)
    }
  } else {
    rawExplanation = generateMultilingualResponse(scoringOutput, queryText, targetLang, detection)
  }

  // 3. Strict Post-Response Check: Strip/Block any numeric score that does not match input score
  const sanitizedExplanation = sanitizeAIResponse(rawExplanation, scoringOutput.score)
  return sanitizedExplanation
}

/**
 * Post-response guard: Scans response for 3-digit score numbers.
 * If any 3-digit number (300-900 range) is found that does not match trueScore (or 900 maxScore),
 * it replaces it with trueScore.
 */
export function sanitizeAIResponse(text: string, trueScore: number): string {
  if (!text) return ''
  return text.replace(/\b([3-8]\d{2}|900)\b/g, (match) => {
    const num = parseInt(match, 10)
    if (num === trueScore || num === 900) {
      return match
    }
    return `${trueScore}`
  })
}

/**
 * Generate onboarding guidance when user has no transaction telemetry yet.
 */
function generateOnboardingAdvice(lang: Language): string {
  switch (lang) {
    case 'ta':
      return "வணக்கம்! உங்களிடம் இதுவரை கடன் மதிப்பெண் இல்லை. Credora AI மதிப்பெண்ணைப் பெற உங்கள் 90 நாள் வங்கி பரிவர்த்தனை CSV ஐ பதிவேற்றவும் அல்லது வங்கி கணக்கை இணைக்கவும்."
    case 'hi':
      return "नमस्ते! आपके पास अभी तक कोई स्कोर उपलब्ध नहीं है। कृपया अपना 90-दिन का बैंक लेनदेन CSV अपलोड करें या Credora AI स्कोर जनरेट करने के लिए अपना प्राथमिक बैंक खाता लिंक करें।"
    case 'mr':
      return "नमस्कार! तुमच्याकडे अद्याप क्रेडिट स्कोअर तयार झालेला नाही. तुमचा Credora स्कोअर तयार करण्यासाठी कृपया तुमचा ९० दिवसांचा व्यवहार CSV अपलोड करा किंवा बँक खाते लिंक करा."
    case 'en':
    default:
      return "Welcome to Credora! You do not have an active cash-flow credit score yet. Please upload your 90-day transaction CSV or link your bank account via RBI Account Aggregator to calculate your score."
  }
}

/**
 * Multilingual Rule-Based NLG Engine
 * Generates natural, conversational, context-aware responses in English, Tamil, Hindi, or Marathi
 * using exact sub-scores and user financial telemetry.
 */
function generateMultilingualResponse(
  scoringOutput: ScoringEngineOutput,
  query: string,
  lang: Language,
  detection: LanguageAndIntentDetection
): string {
  const { score, tier, topPercent, occupation, factor_breakdown, summaryStats, anomaly_flags } = scoringOutput
  const intent = detection.detectedIntent

  const income = factor_breakdown?.income_stability
  const savings = factor_breakdown?.savings_behavior
  const expense = factor_breakdown?.expense_stability
  const payment = factor_breakdown?.payment_consistency
  const repayment = factor_breakdown?.repayment_capacity
  const risk = factor_breakdown?.financial_risk

  // Identify lowest performing factors for root-cause analysis
  const weakFactors: string[] = []
  if (income && income.subScore < 140) weakFactors.push('Income Stability')
  if (savings && savings.subScore < 100) weakFactors.push('Savings Retention')
  if (expense && expense.subScore < 100) weakFactors.push('Expense Outflow Stability')
  if (payment && payment.subScore < 100) weakFactors.push('Payment Consistency')
  if (repayment && repayment.subScore < 100) weakFactors.push('Repayment Capacity')
  if (risk && risk.subScore < 70) weakFactors.push('Liquidity Risk Index')

  const weakestFactorText = weakFactors.length > 0 ? weakFactors.join(' and ') : 'Expense Volatility and Savings Retention'

  // --- 1. SCORE WHY LOW / REASON ---
  if (intent === 'SCORE_WHY_LOW') {
    switch (lang) {
      case 'ta':
        return `உங்கள் தற்போதைய Credora மதிப்பெண் ${score} / 900 (${tier}) ஆகும் (${occupation} தொழில் சான்றளிக்கப்பட்டது). உங்கள் மதிப்பெண் முக்கியமாக ${weakestFactorText} (செலவு மதிப்பெண்: ${expense?.subScore || 0}/150, சேமிப்பு: ${savings?.subScore || 0}/150) ஆகியவற்றால் பாதிக்கப்பட்டுள்ளது. மாதம்தோறும் ₹5,000 அவசர சேமிப்பை பராமரிப்பது மற்றும் வாராந்திர செலவு மாறுபாட்டை சீராக்குவது உங்கள் மதிப்பெண்ணை உயர்த்த உதவும்.`

      case 'hi':
        return `आपका वर्तमान क्रेडोरा स्कोर ${score} / 900 (${tier}) है (${occupation} व्यापार के लिए मूल्यांकन)। आपका स्कोर मुख्य रूप से ${weakestFactorText} (व्यय स्कोर: ${expense?.subScore || 0}/150, बचत स्कोर: ${savings?.subScore || 0}/150) से प्रभावित है। ₹5,000 का लिक्विड बफर बनाए रखने और अनावश्यक यूपीआई खर्चों को कम करने से आपका स्कोर तेजी से बढ़ेगा।`

      case 'mr':
        return `तुमचा Credora स्कोअर ${score} / 900 (${tier}) आहे (${occupation} व्यवसायासाठी मूल्यांकित). तुमचा स्कोअर प्रामुख्याने ${weakestFactorText} (खर्च गुण: ${expense?.subScore || 0}/150, बचत गुण: ${savings?.subScore || 0}/150) मुळे प्रभावित झाला आहे. दरमहा किमान ₹५,००० लिक्विड बफर ठेवल्याने स्कोअर सुधारण्यास मदत होईल.`

      case 'en':
      default:
        return `Your current Credora Score is ${score} / 900 (${tier}, ${topPercent}) evaluated for your trade as a ${occupation}. Your score is primarily influenced by ${weakestFactorText} (Expense Stability: ${expense?.subScore || 0}/150, Savings Retention: ${savings?.subScore || 0}/150). Maintaining a consistent liquid cushion of ₹5,000 and smoothing weekly vendor payments will help raise your score.`
    }
  }

  // --- 2. SCORE IMPROVE / HOW TO REACH 780+ ---
  if (intent === 'SCORE_IMPROVE') {
    switch (lang) {
      case 'ta':
        return `உங்கள் மதிப்பெண் ${score} லிருந்து 780+ க்கு உயர்த்த: 1) மாத சேமிப்பை ₹25,000 ஆக உயர்த்தவும் (+14 புள்ளிகள்), 2) வாராந்திர கொள்முதல் மாறுபாட்டை 15% க்குள் வைக்கவும் (+10 புள்ளிகள்), மற்றும் 3) அனைத்து பில்களையும் நேரத்தில் செலுத்தவும். உங்கள் ${occupation} தொழிலுக்கான வருமான நிலைத்தன்மை (${income?.subScore || 0}/200) ஏற்கனவே வலுவாக உள்ளது.`

      case 'hi':
        return `अपने क्रेडोरा स्कोर को ${score} से 780+ तक पहुँचाने के लिए: 1) अपनी नेट मासिक बचत को ₹25,000 तक बढ़ाएं (+14 अंक), 2) साप्ताहिक आउटफ्लो वेरिएंस को 15% से कम रखें (+10 अंक), और 3) ऑटो-डेबिट भुगतानों को समय पर रखें। आपकी ${occupation} प्रोफ़ाइल के तहत आय स्थिरता (${income?.subScore || 0}/200) पहले से ही मजबूत है।`

      case 'mr':
        return `तुमचा Credora स्कोअर ${score} वरून 780+ वर नेण्यासाठी: १) मासिक बचत ₹२५,००० पर्यंत वाढवा (+१४ गुण), २) साप्ताहिक खर्चातील चढ-उतार १५% पेक्षा कमी ठेवा (+१० गुण), आणि ३) सर्व पेमेंट वेळेवर करा. तुमच्या ${occupation} व्यवसायासाठी उत्पन्न स्थिरता (${income?.subScore || 0}/200) उत्तम आहे.`

      case 'en':
      default:
        return `To boost your score from ${score} to 780+ (${tier}): 1) Automate monthly net savings retention toward ₹25,000 (+14 pts), 2) Cap weekly vendor purchasing swings to under 15% (+10 pts), and 3) Maintain 100% on-time debit discipline. Your baseline income stability score for ${occupation} is already strong at ${income?.subScore || 0}/200.`
    }
  }

  // --- 3. SPENDING ANALYSIS / EXPENSE ---
  if (intent === 'SPENDING_ANALYSIS') {
    switch (lang) {
      case 'ta':
        return `உங்கள் செலவு நிலைத்தன்மை மதிப்பெண் ${expense?.subScore || 0} / 150 ஆகும். ${expense?.reason || 'வாராந்திர செலவுகளில் மாறுபாடு அதிகமாக உள்ளது.'} உங்கள் UPI மற்றும் சப்ளையர் கொள்முதல்களுக்கு ₹15,000/மாத வரம்பு நிர்ணயிப்பது ரொக்க ஓட்டத்தை சீராக்க உதவும்.`

      case 'hi':
        return `आपका व्यय स्थिरता स्कोर ${expense?.subScore || 0} / 150 है। ${expense?.reason || 'साप्ताहिक खर्चों में उतार-चढ़ाव देखा गया है।'} अपने व्यावसायिक और सप्लायर भुगतानों को पाक्षिक (bi-weekly) शेड्यूल पर लाने से आपकी वित्तीय स्थिरता में सुधार होगा।`

      case 'mr':
        return `तुमचा खर्च स्थिरता स्कोअर ${expense?.subScore || 0} / 150 आहे. ${expense?.reason || 'साप्ताहिक खर्चात बदल दिसून येत आहेत.'} सप्लायर खरेदीचे नियमित नियोजन केल्यास खर्च नियंत्रणात राहील.`

      case 'en':
      default:
        return `Your Expense Outflow Stability score is ${expense?.subScore || 0} / 150. ${expense?.reason || 'Higher variance in weekly transactions reduces predictability.'} Establishing a dedicated weekly budget for inventory and utilities will smooth out cash spikes and enhance your score.`
    }
  }

  // --- 4. RISK ANALYSIS / SAFETY ---
  if (intent === 'RISK_ANALYSIS') {
    switch (lang) {
      case 'ta':
        return `உங்கள் நிதி ஆபத்து குறியீடு (Risk Index) ${risk?.subScore || 0} / 100 ஆகும். ${risk?.reason || 'உங்கள் நிதி நிலைமை பாதுகாப்பாக உள்ளது.'} கணக்கில் ${anomaly_flags?.length || 0} ஒழுங்கற்ற பரிவர்த்தனைகள் காணப்படுகின்றன. அவசர தேவைக்கு ₹10,000 இருப்பை எப்போதும் பராமரிக்க பரிந்துரைக்கப்படுகிறது.`

      case 'hi':
        return `आपका लिक्विडिटी रिस्क इंडेक्स ${risk?.subScore || 0} / 100 है। ${risk?.reason || 'आपकी वित्तीय स्थिति स्थिर है।'} आपके खाते में ${anomaly_flags?.length || 0} असामान्य फ्लैग हैं। आपातकालीन स्थितियों के लिए हमेशा 10% लिक्विडिटी बनाए रखें।`

      case 'mr':
        return `तुमचा आर्थिक धोका निर्देशांक ${risk?.subScore || 0} / 100 आहे. ${risk?.reason || 'तुमची स्थिती सुरक्षित आहे.'} खात्यात ${anomaly_flags?.length || 0} अनपेक्षित व्यवहार आढळले आहेत.`

      case 'en':
      default:
        return `Your Liquidity Risk Score is ${risk?.subScore || 0} / 100. ${risk?.reason || 'Your risk level is acceptable for thin-file underwriting.'} There are ${anomaly_flags?.length || 0} transaction anomaly flags triggered. Maintaining a ₹10,000 emergency liquid cushion keeps your risk profile low.`
    }
  }

  // --- 5. ANOMALY / UNUSUAL SPIKES ---
  if (intent === 'ANOMALY_QUERY') {
    const flagList = anomaly_flags && anomaly_flags.length > 0 ? anomaly_flags.map(f => f.title).join(', ') : 'No high-risk anomalies detected.'
    switch (lang) {
      case 'ta':
        return `உங்கள் கணக்கில் ${anomaly_flags?.length || 0} விசித்திரமான பரிவர்த்தனை எச்சரிக்கைகள் உள்ளன (${flagList}). வழக்கத்திற்கு மாறான பெரிய UPI பரிவர்த்தனைகளைத் தவிர்ப்பது உங்கள் மதிப்பெண்ணைப் பாதுகாக்கும்.`

      case 'hi':
        return `आपके खाते में ${anomaly_flags?.length || 0} असामान्य लेनदेन फ्लैग पाए गए हैं (${flagList})। अचानक बड़े आउटफ्लो से बचने से आपका रिस्क स्कोर बेहतर रहेगा।`

      case 'mr':
        return `तुमच्या खात्यात ${anomaly_flags?.length || 0} असामान्य व्यवहार आढळले आहेत (${flagList}).`

      case 'en':
      default:
        return `Credora's anomaly detection engine flagged ${anomaly_flags?.length || 0} unusual transaction pattern(s): ${flagList}. Keeping transaction sizes consistent prevents risk penalties.`
    }
  }

  // --- 6. FINANCIAL SUMMARY / OVERALL HEALTH ---
  if (intent === 'FINANCIAL_SUMMARY') {
    switch (lang) {
      case 'ta':
        return `உங்கள் ஒட்டுமொத்த Credora நிதி சுருக்கம்: மதிப்பெண் ${score} / 900 (${tier}, ${topPercent}) • தொழில்: ${occupation} • வருமான நிலைத்தன்மை: ${income?.subScore || 0}/200 • சேமிப்பு பராமரிப்பு: ${savings?.subScore || 0}/150 • செலவு நிலைத்தன்மை: ${expense?.subScore || 0}/150 • கட்டண ஒழுங்கு: ${payment?.subScore || 0}/150. உங்கள் வருமான அடிப்படை வலுவாக உள்ளது, சேமிப்பை அதிகரிப்பதே அடுத்த இலக்கு.`

      case 'hi':
        return `आपका समग्र क्रेडोरा वित्तीय सारांश: स्कोर ${score} / 900 (${tier}, ${topPercent}) • व्यापार श्रेणी: ${occupation} • आय स्थिरता: ${income?.subScore || 0}/200 • बचत दर: ${savings?.subScore || 0}/150 • व्यय स्थिरता: ${expense?.subScore || 0}/150 • भुगतान अनुशासन: ${payment?.subScore || 0}/150। आपकी आय की नींव मजबूत है, बचत दर बढ़ाना मुख्य लक्ष्य है।`

      case 'mr':
        return `तुमचा एकूण Credora आर्थिक सारांश: स्कोअर ${score} / 900 (${tier}) • व्यवसाय: ${occupation} • उत्पन्न स्थिरता: ${income?.subScore || 0}/200 • बचत प्रमाण: ${savings?.subScore || 0}/150 • खर्च स्थिरता: ${expense?.subScore || 0}/150. तुमची स्थिती उत्तम आहे.`

      case 'en':
      default:
        return `Your Credora Financial Health Summary: Score ${score} / 900 (${tier}, ${topPercent}) evaluated for your trade as ${occupation}. Sub-scores: Income Stability ${income?.subScore || 0}/200, Savings Retention ${savings?.subScore || 0}/150, Expense Stability ${expense?.subScore || 0}/150, Payment Consistency ${payment?.subScore || 0}/150. Your income foundation is solid; increasing net savings will yield immediate score growth.`
    }
  }

  // --- 7. DEFAULT GENERAL GUIDANCE ---
  switch (lang) {
    case 'ta':
      return `வணக்கம்! உங்கள் சரிபார்க்கப்பட்ட 90 நாள் ரொக்க ஓட்ட தரவின்படி, உங்கள் Credora மதிப்பெண் ${score} / 900 (${tier}) ஆகும். உங்கள் ${occupation} தொழிலுக்கான வருமான நிலைத்தன்மை மதிப்பெண் ${income?.subScore || 0}/200 மற்றும் சேமிப்பு மதிப்பெண் ${savings?.subScore || 0}/150 ஆகும். உங்கள் கடன் மதிப்பெண், செலவுகள் அல்லது சேமிப்பை உயர்த்தும் வழிகள் குறித்து என்னிடம் கேட்கலாம்.`

    case 'hi':
      return `नमस्ते! आपके 90-दिन के कैश फ्लो टेलीमेट्री के आधार पर, आपका क्रेडोरा स्कोर ${score} / 900 (${tier}) है। आपकी ${occupation} प्रोफ़ाइल के तहत आय स्थिरता ${income?.subScore || 0}/200 और बचत स्कोर ${savings?.subScore || 0}/150 है। आप मुझसे अपने स्कोर, खर्चों या बचत बढ़ाने के उपायों के बारे में पूछ सकते हैं।`

    case 'mr':
      return `नमस्कार! तुमच्या ९० दिवसांच्या कॅश-फ्लो डेटाच्या आधारे, तुमचा Credora स्कोअर ${score} / 900 (${tier}) आहे. तुमच्या ${occupation} व्यवसायासाठी उत्पन्न गुण ${income?.subScore || 0}/200 आणि बचत गुण ${savings?.subScore || 0}/150 आहेत. मी तुम्हाला कशी मदत करू शकतो?`

    case 'en':
    default:
      return `Namaste! Based on your verified 90-day cash flow telemetry, your Credora Score is ${score} / 900 (${tier}, ${topPercent}). Your ${occupation} baseline income score is ${income?.subScore || 0}/200 and savings score is ${savings?.subScore || 0}/150. Feel free to ask how to improve your score or analyze your spending habits!`
  }
}

/**
 * Send prompt to Gemini REST API when LLM is enabled
 */
async function callLLMAdvisorAPI(
  scoringOutput: ScoringEngineOutput,
  query: string,
  lang: Language,
  detection: LanguageAndIntentDetection,
  apiKey: string
): Promise<string> {
  const langName = lang === 'hi' ? 'Hindi' : lang === 'ta' ? 'Tamil' : lang === 'mr' ? 'Marathi' : 'English'

  const systemPrompt = `You are the Credora AI Financial Advisor explaining an Indian MSME customer's credit score.
CRITICAL CONSTRAINTS:
1. You must ONLY explain the provided score (${scoringOutput.score}). You CANNOT change, recalculate, or invent a score.
2. Language: Respond in ${langName}. If the query is Tanglish or Hinglish, answer naturally in ${langName} script/style.
3. Keep response concise, natural, conversational, and supportive (2-4 sentences).
4. DO NOT promise loan approvals or claim to be a regulated bank.`

  const userPrompt = `Customer Query: "${query || 'Explain my score'}"
Structured Score Output JSON: ${JSON.stringify(scoringOutput)}`

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
      ]
    })
  })

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (text) return text

  return generateMultilingualResponse(scoringOutput, query, lang, detection)
}
