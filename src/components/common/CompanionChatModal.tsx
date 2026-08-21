import React, { useState } from 'react';
import { MessageCircle, Send, Volume2, X, Sparkles, Heart, Bot } from 'lucide-react';
import { ApiClient } from '../../services/apiClient';
import { speakText } from '../../utils/audioSpeech';
import { Senior } from '../../types';

interface CompanionChatModalProps {
  senior: Senior;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'senior' | 'companion';
  text: string;
  time: string;
}

export const CompanionChatModal: React.FC<CompanionChatModalProps> = ({ senior, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'companion',
      text: `Hello ${senior.name}! ❤️ I am your KinCare companion. I'm here to support your daily wellness, celebrate your steps, and keep your family informed. How are you feeling right now?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'senior',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await ApiClient.companionChat(senior.id, textToSend);
      const companionMsg: ChatMessage = {
        id: `comp_${Date.now()}`,
        sender: 'companion',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, companionMsg]);
      speakText(reply, 0.88);
    } catch (e) {
      const fallbackMsg: ChatMessage = {
        id: `comp_err_${Date.now()}`,
        sender: 'companion',
        text: `I'm with you, ${senior.name}! You are doing wonderful today. Let's keep your streak glowing!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'How is my daily routine going?',
    'Tell me an encouraging quote ☀️',
    'What is my current streak?',
    'Remind me when dinner is 🍽️'
  ];

  return (
    <div id="companion-chat-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border border-stone-200 rounded-[32px] p-5 sm:p-6 text-stone-900 shadow-2xl flex flex-col h-[640px] max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-stone-200 flex items-center justify-center text-[#FF6321]">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
                <span>AI Daily Companion</span>
                <Sparkles className="w-4 h-4 text-[#FF6321]" />
              </h3>
              <p className="text-xs text-stone-500 font-normal">Loving voice companion for {senior.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-100 text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'senior' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[24px] p-4 text-base font-normal leading-relaxed ${
                  msg.sender === 'senior'
                    ? 'bg-[#FF6321] text-white rounded-tr-none'
                    : 'bg-[#FAF8F5] text-stone-800 border border-stone-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
              <div className="flex items-center gap-2 mt-1 px-2 text-xs text-stone-400">
                <span>{msg.time}</span>
                {msg.sender === 'companion' && (
                  <button
                    onClick={() => speakText(msg.text, 0.88)}
                    className="hover:text-[#FF6321] flex items-center gap-1 font-semibold text-stone-500 transition-colors"
                    title="Read aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-[#FF6321] text-sm font-medium pl-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Companion is thinking warmly...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-xs whitespace-nowrap bg-[#FAF8F5] hover:bg-stone-100 text-stone-700 border border-stone-200 px-3.5 py-1.5 rounded-full transition-colors font-medium shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="pt-2 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message or question..."
            className="flex-1 bg-[#FAF8F5] border border-stone-200 rounded-2xl px-4 py-3 text-base text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 bg-[#FF6321] hover:bg-[#e85516] active:scale-95 text-white font-bold rounded-2xl flex items-center justify-center transition-all disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
