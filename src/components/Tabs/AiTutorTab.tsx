import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language } from '../../types';
import { GeminiService } from '../../services/gemini';
import { Bot, Send, Sparkles, Lightbulb, User, Globe, HelpCircle, BookOpen, MessageSquare } from 'lucide-react';

interface AiTutorTabProps {
  currentLanguage: Language;
  accentColor: string;
  onRewardXp: (amount: number) => void;
}

const SUGGESTED_PROMPTS = [
  '🌍 Ask any general knowledge question',
  '☕ Ordering coffee roleplay',
  '📚 Explain past tense grammar',
  '✈️ Hotel check-in conversation',
];

export const AiTutorTab: React.FC<AiTutorTabProps> = ({
  currentLanguage,
  accentColor,
  onRewardXp,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: `Bonjour! I am your Gemini AI Assistant & ${currentLanguage} Tutor. Ask me any question on any topic!`,
      translation: `Hello! I am your Gemini AI Assistant & ${currentLanguage} Tutor. Ask me any question on any topic!`,
      isUser: false,
      timestamp: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: Date.now(),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Call Gemini 2.5 Flash API with full multi-turn conversation history
    const res = await GeminiService.chatWithGeminiMultiTurn(updatedHistory, currentLanguage);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: res.reply,
      translation: res.translation,
      correction: res.correction,
      isUser: false,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
    onRewardXp(10);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '20px', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Gemini AI Banner */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: `${accentColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={24} color={accentColor} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 900 }}>Gemini 2.5 AI Assistant</h3>
              <span style={{ fontSize: '11px', fontWeight: 800, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '10px' }}>
                Full Multi-Turn
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              Live API Connection • Asks & Answers Anything
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#faf5ff', border: '1px solid #f3e8ff', padding: '6px 12px', borderRadius: '14px' }}>
          <Sparkles size={14} color="#a855f7" />
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#9333ea' }}>Gemini Pro Engine</span>
        </div>
      </div>

      {/* Messages List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              padding: '16px 20px',
              borderRadius: msg.isUser ? '22px 22px 4px 22px' : '22px 22px 22px 4px',
              backgroundColor: msg.isUser ? accentColor : 'var(--card-bg)',
              color: msg.isUser ? '#ffffff' : 'var(--text-primary)',
              border: msg.isUser ? 'none' : '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {/* Formatted Reply Body */}
            <div style={{ fontSize: '15px', fontWeight: 500, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {msg.text}
            </div>

            {/* Translation Box */}
            {msg.translation && (
              <div style={{ fontSize: '13px', marginTop: '8px', paddingTop: '8px', borderTop: msg.isUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border-color)', opacity: 0.9, fontStyle: 'italic' }}>
                Translation: {msg.translation}
              </div>
            )}

            {/* Grammar Correction Box */}
            {msg.correction && (
              <div style={{ marginTop: '10px', padding: '10px 14px', background: '#fefce8', border: '1px solid #fef08a', borderRadius: '10px', fontSize: '12px', color: '#854d0e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lightbulb size={16} color="#ca8a04" />
                <span><strong>Grammar Tip:</strong> {msg.correction}</span>
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', borderRadius: '18px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Sparkles size={16} color={accentColor} className="animate-spin" />
            <span>Gemini AI is thinking & writing answer...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Action Prompts */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 0', margin: '8px 0' }}>
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            className="btn-outline"
            onClick={() => handleSend(prompt.slice(2).trim())}
            style={{ fontSize: '12px', padding: '6px 14px', whiteSpace: 'nowrap', borderRadius: '16px' }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{ display: 'flex', gap: '10px' }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Ask Gemini AI anything in ${currentLanguage} or English...`}
          style={{
            flex: 1,
            padding: '14px 20px',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            fontSize: '15px',
            outline: 'none',
          }}
        />
        <button type="submit" className="btn-primary" disabled={isTyping} style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, justifyContent: 'center', backgroundColor: accentColor }}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
