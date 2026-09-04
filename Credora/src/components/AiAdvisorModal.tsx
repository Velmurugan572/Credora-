'use client'

import { useState, useEffect } from 'react'
import { Sparkles, X, Send, Bot, User, Globe } from 'lucide-react'
import { Language } from '@/lib/types'

interface AiAdvisorModalProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: string
}

export default function AiAdvisorModal({ isOpen, onClose }: AiAdvisorModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [language, setLanguage] = useState<Language>('en')

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/advisor', { cache: 'no-store' })
      const data = await res.json()
      if (data.success && data.messages) {
        setMessages(data.messages)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchMessages()
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim()) return

    if (!textToSend) setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query, language })
      })
      const data = await res.json()
      if (data.success && data.messages) {
        setMessages(data.messages)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsTyping(false)
    }
  }

  const getPromptChips = (lang: Language) => {
    switch (lang) {
      case 'hi':
        return [
          'मेरा स्कोर कम क्यों है?',
          'क्रेडिट स्कोर कैसे सुधारूं?',
          'मेरा खर्च कहाँ ज्यादा है?',
          'वित्तीय स्थिति का सारांश दो'
        ]
      case 'ta':
        return [
          'எனது மதிப்பெண் ஏன் குறைந்துள்ளது?',
          'மதிப்பெண்ணை எப்படி உயர்த்தலாம்?',
          'நான் எங்கே அதிக செலவு செய்கிறேன்?',
          'நிதி சுருக்கம் தாருங்கள்'
        ]
      case 'mr':
        return [
          'माझा स्कोअर कमी का आहे?',
          'क्रेडिट स्कोअर कसा सुधारू?',
          'माझा खर्च कुठे जास्त आहे?',
          'माझ्या वित्ताचा सारांश द्या'
        ]
      case 'en':
      default:
        return [
          'Why is my credit score low?',
          'How can I reach 780 score?',
          'Where am I spending most?',
          'Is my situation risky?'
        ]
    }
  }

  const getPlaceholder = (lang: Language) => {
    switch (lang) {
      case 'hi':
        return 'हिंदी या हिंग्लिश में पूछें (उदा. मेरा स्कोर कम क्यों है?)...'
      case 'ta':
        return 'தமிழ் அல்லது Tanglish-ல் கேட்கவும் (उदा. En score yen kammi?)...'
      case 'mr':
        return 'मराठीत विचारा (उदा. माझा स्कोअर कसा सुधारू?)...'
      case 'en':
      default:
        return 'Ask AI Advisor in English, Hindi, Tamil, or Marathi...'
    }
  }

  const promptChips = getPromptChips(language)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg h-[90vh] max-h-[720px] flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-credora-navy text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-credora-mint text-credora-navy flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-1.5">
                Credora AI Advisor
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  EXPLANATION ONLY
                </span>
              </h3>
              <p className="text-xs text-slate-300">Real-time Cash Flow Explanation Layer</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-slate-800 text-slate-200 text-xs font-bold rounded-xl px-2.5 py-1 border border-slate-700 focus:outline-none"
            >
              <option value="en">English 🇬🇧</option>
              <option value="hi">हिंदी 🇮🇳</option>
              <option value="ta">தமிழ் 🇮🇳</option>
              <option value="mr">मराठी 🇮🇳</option>
            </select>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50">
          {messages.length === 0 ? (
            <div className="text-center py-8 space-y-2 text-slate-500">
              <Sparkles className="w-8 h-8 text-credora-emerald mx-auto" />
              <p className="text-xs font-bold text-slate-700">Ask Credora AI anything about your score</p>
              <p className="text-[11px] text-slate-400">The AI explains your deterministic score output without altering it.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAi = msg.sender === 'ai'
              return (
                <div key={msg.id} className={`flex items-start space-x-2.5 ${isAi ? '' : 'flex-row-reverse space-x-reverse'}`}>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isAi ? 'bg-credora-emerald text-white' : 'bg-slate-900 text-white'
                    }`}
                  >
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                      isAi
                        ? 'bg-white text-slate-800 border border-slate-200/80 shadow-xs'
                        : 'bg-credora-navy text-white shadow-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span className={`text-[10px] block mt-1 ${isAi ? 'text-slate-400' : 'text-slate-300'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          {isTyping && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold italic p-2">
              <Sparkles className="w-4 h-4 animate-spin text-credora-emerald" />
              <span>Analyzing deterministic telemetry JSON...</span>
            </div>
          )}
        </div>

        {/* Suggested Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex space-x-2 overflow-x-auto text-[11px]">
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl font-bold whitespace-nowrap transition flex-shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={getPlaceholder(language)}
            className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold rounded-2xl px-4 py-3 focus:outline-none focus:border-credora-emerald"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-3 bg-credora-emerald hover:bg-emerald-800 disabled:opacity-50 text-white rounded-2xl transition flex-shrink-0 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
