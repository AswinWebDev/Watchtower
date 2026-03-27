import React, { useState } from 'react';
import { useStore } from '../store';
import { Bot, Send, Sparkles, ShieldCheck, Lightbulb } from 'lucide-react';

const EXAMPLE_PROMPTS = [
  "Limit my daily OnePlay bets to 0.5 OCT",
  "Block all OneDEX swaps over 1 OCT",
  "Cap my OnePoker stakes at 0.3 OCT per week",
  "Don't let me spend more than 0.5 OCT on any dApp today",
];

export const AiPolicies = () => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { chatMessages, addChatMessage, addRule } = useStore();

  const handleSend = async (e: React.FormEvent, override?: string) => {
    e?.preventDefault();
    const prompt = override || input;
    if (!prompt.trim()) return;

    addChatMessage({ role: 'user', text: prompt });
    setInput('');
    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:3001/api/parse-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      
      if (data.success && data.policy) {
        addRule({
          description: data.policy.explanation || prompt,
          category: data.policy.target || 'General',
          limit: data.policy.amountDetails?.limit || 0,
          period: data.policy.amountDetails?.timeframe?.toLowerCase() || 'daily',
          active: true
        });
        addChatMessage({ 
          role: 'policy', 
          text: data.policy.explanation || prompt,
          policy: data.policy
        });
      } else {
        throw new Error(data.error || 'Failed to parse policy');
      }
    } catch (err) {
      console.warn("Backend unavailable. Using fallback.", err);
      const limitMatch = prompt.match(/\d+/);
      const limit = limitMatch ? parseInt(limitMatch[0], 10) : 0;
      
      addRule({
        description: prompt,
        category: 'All',
        limit: limit,
        period: 'daily',
        active: true
      });
      addChatMessage({ 
        role: 'policy', 
        text: prompt,
        policy: { target: 'All', amountDetails: { limit, timeframe: 'daily' } }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-[1000px] mx-auto pt-2">
      <div className="mb-6 flex items-center p-4 bg-[#111] border border-[#1f1f1f] rounded-xl">
        <div className="w-[38px] h-[38px] rounded-lg bg-[#1a1a1a] border border-[#2a2a2c] flex items-center justify-center mr-4 shrink-0">
          <Sparkles className="w-[18px] h-[18px] text-primary" strokeWidth={1.5} />
        </div>
        <p className="text-[13px] text-textMuted leading-relaxed">
          Chat with <span className="text-white font-semibold flex-inline">Watchtower AI</span> to set up guardian policies. They are compiled into <span className="text-primary font-bold">Move smart contracts</span>.
        </p>
      </div>

      {/* Quick Prompt Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {EXAMPLE_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={(e) => handleSend(e, prompt)}
            disabled={isProcessing}
            className="px-3 py-2 text-[11px] font-bold tracking-wide bg-[#111] border border-[#1f1f1f] hover:bg-[#1a1a1a] hover:border-[#333] rounded-md text-textMuted hover:text-white transition-colors flex items-center disabled:opacity-50"
          >
            <Lightbulb className="w-3 h-3 mr-2 text-white/40" />
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-[#111] border border-[#1f1f1f] rounded-xl p-6 mb-4 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
          {chatMessages.map((msg: any, i: number) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="max-w-[75%] p-4 rounded-xl bg-[#161618] border border-[#262626] rounded-tl-sm flex items-start">
                  <div className="w-[28px] h-[28px] rounded bg-[#222] border border-[#333] flex items-center justify-center mr-3 shrink-0">
                    <Bot className="w-3.5 h-3.5 text-white/70" />
                  </div>
                  <p className="text-[13px] leading-relaxed text-white/90 whitespace-pre-line pt-1">{msg.text}</p>
                </div>
              )}
              {msg.role === 'user' && (
                <div className="max-w-[75%] p-3.5 px-5 rounded-xl bg-[#1f1f1f] rounded-tr-sm">
                  <p className="text-[13px] text-white font-medium">{msg.text}</p>
                </div>
              )}
              {msg.role === 'policy' && (
                <div className="max-w-[75%] p-4 rounded-xl bg-[#161313] border border-[#300a0a] rounded-tl-sm flex flex-col space-y-3">
                  <div className="flex items-center text-primary font-bold text-[11px] tracking-widest uppercase">
                    <ShieldCheck className="w-[14px] h-[14px] mr-2" />
                    Policy Generated & Deployed
                  </div>
                  <div className="bg-[#111] p-4 rounded-lg border border-[#262626]">
                    <p className="text-[13px] text-white font-medium pb-3 mb-3 border-b border-[#262626] leading-relaxed">"{msg.text}"</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-[9px] px-2 py-1 bg-[#222] rounded uppercase font-bold tracking-widest text-textMuted border border-[#333]">{msg.policy?.target || 'All'}</span>
                      <span className="text-[9px] px-2 py-1 bg-[#dd3300] rounded font-bold tracking-widest text-[#fff]">LIMIT: {msg.policy?.amountDetails?.limit || 0} OCT</span>
                      <span className="text-[9px] px-2 py-1 bg-[#222] rounded uppercase font-bold tracking-widest text-textMuted border border-[#333]">{msg.policy?.amountDetails?.timeframe || 'daily'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
               <div className="p-3 px-4 rounded-xl bg-[#161618] border border-[#262626] rounded-tl-sm flex items-center space-x-2">
                 <div className="w-[4px] h-[4px] bg-[#666] rounded-full animate-pulse"></div>
                 <div className="w-[4px] h-[4px] bg-[#666] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-[4px] h-[4px] bg-[#666] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSend} className="relative mt-auto">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Translate intent to smart contract... e.g., 'Cap my OnePlay bets at 20 OCT daily'"
          className="w-full bg-[#111] border border-[#1f1f1f] rounded-lg pl-5 pr-14 py-4 text-[13px] font-medium text-white placeholder-[#555] focus:outline-none focus:border-primary/50 transition-colors"
          disabled={isProcessing}
        />
        <button 
          type="submit" 
          disabled={isProcessing || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white hover:bg-neutral-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-[14px] h-[14px] text-black" />
        </button>
      </form>
    </div>
  );
};
