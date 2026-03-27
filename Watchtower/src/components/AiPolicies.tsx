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
  const [messages, setMessages] = useState<Array<{role: 'ai' | 'user' | 'policy', text: string, policy?: any}>>([
    { role: 'ai', text: "Hello! I am your Watchtower Guardian AI. I translate natural language instructions into strict Move smart contract policies that protect your OneWallet on OneChain.\n\nTry commands like: \"Limit my daily OnePlay bets to 20 OCT\" or \"Block all OneDEX swaps over 100 OCT\"." }
  ]);
  const { addRule } = useStore();

  const handleSend = async (e: React.FormEvent, override?: string) => {
    e?.preventDefault();
    const prompt = override || input;
    if (!prompt.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: prompt }]);
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
        setMessages(prev => [...prev, { 
          role: 'policy', 
          text: data.policy.explanation || prompt,
          policy: data.policy
        }]);
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
      setMessages(prev => [...prev, { 
        role: 'policy', 
        text: prompt,
        policy: { target: 'All', amountDetails: { limit, timeframe: 'daily' } }
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
      <div className="mb-4 flex items-center p-4 bg-primary/10 border border-primary/20 rounded-xl">
        <Sparkles className="w-6 h-6 text-primary mr-3 shrink-0" />
        <p className="text-sm text-primary/90">
          Chat with Watchtower AI to set up Guardian Policies for your OneWallet. Policies are compiled into Move smart contracts that enforce your rules on-chain.
        </p>
      </div>

      {/* Quick Prompt Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {EXAMPLE_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={(e) => handleSend(e, prompt)}
            disabled={isProcessing}
            className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-lg text-white/70 hover:text-white transition-all flex items-center disabled:opacity-50"
          >
            <Lightbulb className="w-3 h-3 mr-1.5 text-primary/60" />
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 glass-panel p-6 mb-4 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="max-w-[80%] p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm leading-relaxed text-textMain/90 whitespace-pre-line">{msg.text}</p>
                </div>
              )}
              {msg.role === 'user' && (
                <div className="max-w-[80%] p-4 rounded-2xl bg-primary/20 border border-primary/30 rounded-tr-sm">
                  <p className="text-sm text-white/90">{msg.text}</p>
                </div>
              )}
              {msg.role === 'policy' && (
                <div className="max-w-[80%] p-4 rounded-2xl bg-green-500/10 border border-green-500/20 rounded-tl-sm flex flex-col space-y-2 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                  <div className="flex items-center text-green-400 font-bold text-sm mb-1">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Policy Generated & Deployed
                  </div>
                  <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                    <p className="text-sm text-white/90 font-medium pb-2 mb-2 border-b border-white/10">"{msg.text}"</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 bg-white/10 rounded uppercase tracking-wider text-textMuted">{msg.policy?.target || 'All'}</span>
                      <span className="text-xs px-2 py-1 bg-white/10 rounded font-bold text-textMain">Limit: {msg.policy?.amountDetails?.limit || 0} OCT</span>
                      <span className="text-xs px-2 py-1 bg-white/10 rounded capitalize text-textMuted">{msg.policy?.amountDetails?.timeframe || 'daily'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start opacity-70">
               <div className="p-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex items-center space-x-2">
                 <div className="w-2 h-2 bg-primary/70 rounded-full animate-pulse"></div>
                 <div className="w-2 h-2 bg-primary/70 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 bg-primary/70 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSend} className="relative group">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a security rule... e.g., 'Cap my OnePlay bets at 20 OCT daily'"
          className="glass-input pl-4 pr-12 py-4 w-full text-base shadow-[0_0_15px_rgba(59,130,246,0.1)] focus:shadow-[0_0_25px_rgba(59,130,246,0.15)] focus:border-primary/50"
          disabled={isProcessing}
        />
        <button 
          type="submit" 
          disabled={isProcessing || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
};
