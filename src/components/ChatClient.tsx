/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useChat } from '@ai-sdk/react';
import { Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ChatClient() {
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const { messages, append, sendMessage, status, isLoading: chatIsLoading, setMessages } = useChat({
    // @ts-ignore - 'body' is supported at runtime but missing in this specific version's types
    body: { sessionId }
  }) as any;
  const bottomRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    
    if (append) {
       await append({ role: 'user', content: userMsg });
    } else if (sendMessage) {
       await sendMessage({ role: 'user', content: userMsg });
    }
  };

  const isSending = chatIsLoading || status === 'submitted' || status === 'streaming';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // NEW: Hydrate Chat History automatically per session
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/chat/history?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            const mappedHistory = data.messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              createdAt: m.created_at
            }));
            setMessages(mappedHistory);
          }
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    
    // Safety check to only fetch if the UI is completely blank (e.g., initial page load)
    // This prevents aggressively overriding active conversational arrays
    if (messages.length === 0) {
      fetchHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleClearChat = () => {
    if (setMessages) setMessages([]);
    setSessionId(crypto.randomUUID());
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 md:p-6 h-[calc(100vh-5rem)]">
      <div className="flex justify-end mb-3">
        <button 
          type="button"
          onClick={handleClearChat}
          disabled={!messages || messages.length === 0}
          className={`flex items-center gap-2 text-xs transition-colors px-4 py-2 rounded-full border ${
            messages && messages.length > 0
              ? 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/5 cursor-pointer'
              : 'text-gray-600 bg-transparent border-transparent cursor-not-allowed opacity-50'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-6 p-4 backdrop-blur-sm bg-white/[0.02] border border-white/5 rounded-3xl mb-4 scrollbar-thin scrollbar-thumb-white/10">
        {(!messages || messages.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Bot className="w-16 h-16 mb-4 text-purple-400" />
            <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
            <p className="text-sm max-w-sm">Ask me anything about the documents you've uploaded.</p>
          </div>
        ) : (
          messages.map((m: any, i: number) => (
            <div key={m.id || i} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div 
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  m.role === 'user' 
                    ? 'bg-indigo-500 text-white rounded-tr-sm' 
                    : 'bg-white/10 text-gray-100 rounded-tl-sm border border-white/5 whitespace-pre-wrap flex flex-col gap-2'
                }`}
              >
                <div className="text-sm">
                  {m.content || (m.parts && m.parts.map((p: any) => p.text).join('')) || m.display || (
                    !m.toolInvocations && <span className="opacity-50 italic">Generating response...</span>
                  )}
                  {m.toolInvocations && m.toolInvocations.map((ti: any) => (
                    <div key={ti.toolCallId} className="mt-3 bg-black/30 shadow-inner border border-white/5 p-3 rounded-xl text-xs font-mono">
                      <div className="text-gray-400 mb-1 flex items-center gap-2">
                        <Bot className="w-3 h-3" /> Agent Backend Math Process
                      </div>
                      <div className="text-indigo-300">Expression: {ti.args.expression}</div>
                      <div className="text-green-400 font-bold mt-1">
                        Computed Result: {ti.state === 'result' ? (ti.result?.result ?? JSON.stringify(ti.result)) : <span className="animate-pulse">Computing...</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))
        )}
        {isSending && messages?.[messages.length - 1]?.role === 'user' && (
           <div className="flex gap-4 justify-start">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
               <Loader2 className="w-4 h-4 text-white animate-spin" />
             </div>
             <div className="bg-white/10 rounded-2xl rounded-tl-sm px-5 py-3 border border-white/5 flex items-center">
               <div className="flex gap-1">
                 <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
               </div>
             </div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask something about your documents..."
          className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-gray-500"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isSending}
          className="absolute right-2 top-2 p-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
