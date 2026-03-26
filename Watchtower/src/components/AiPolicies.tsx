import React, { useState } from 'react';
import { useStore } from '../store';
import { Bot, Send, Sparkles, ShieldCheck } from 'lucide-react';

export const AiPolicies = () => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addRule, rules } = useStore();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:3001/api/parse-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      });
      
      const data = await response.json();
      
      if (data.success && data.policy) {
        // Map the backend JSON structure to our frontend store structure
        addRule({
          description: data.policy.explanation || input,
          category: data.policy.target || 'General',
          limit: data.policy.amountDetails?.limit || 0,
          period: data.policy.amountDetails?.timeframe?.toLowerCase() || 'daily',
          active: true
        });
      } else {
        throw new Error(data.error || 'Failed to parse policy');
      }
    } catch (err) {
      console.warn("Backend unavailable or failed. Using fallback.", err);
      // Fallback for demo purposes if backend isn't running
      const limitMatch = input.match(/\d+/);
      const limit = limitMatch ? parseInt(limitMatch[0], 10) : 0;
      
      addRule({
        description: input,
        category: 'GameFi (Fallback)',
        limit: limit,
        period: 'daily',
        active: true
      });
    } finally {
      setInput('');
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
      <div className="mb-6 flex items-center p-4 bg-primary/10 border border-primary/20 rounded-xl">
        <Sparkles className="w-6 h-6 text-primary mr-3 shrink-0" />
        <p className="text-sm text-primary/90">
          Chat with your Watchtower AI to setup Guardian Rules. Try saying: <span className="text-white italic">"Don't let me spend more than 10 USDO on games today."</span>
        </p>
      </div>

      <div className="flex-1 glass-panel p-6 mb-4 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm flex items-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3 shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm leading-relaxed text-textMain/90">
                Hello! I am your Watchtower Guardian. Tell me how you'd like to protect your OneWallet today. I translate your natural language instructions into strict Move smart contract policies.
              </p>
            </div>
          </div>
          
          {isProcessing && (
            <div className="flex justify-start opacity-70">
               <div className="p-3 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex items-center space-x-2">
                 <div className="w-2 h-2 bg-primary/70 rounded-full animate-pulse"></div>
                 <div className="w-2 h-2 bg-primary/70 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 bg-primary/70 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
               </div>
            </div>
          )}
          {rules.length > 0 && !isProcessing && (
            <div className="flex justify-start opacity-100 transition-opacity animate-in fade-in slide-in-from-bottom-2">
              <div className="max-w-[80%] p-4 rounded-2xl bg-green-500/10 border border-green-500/20 rounded-tl-sm flex flex-col space-y-2 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <div className="flex items-center text-green-400 font-bold text-sm mb-1">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Action: Policy Generated & Enforced
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                  <p className="text-sm text-white/90 font-medium pb-2 mb-2 border-b border-white/10">"{rules[0].description}"</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs px-2 py-1 bg-white/10 rounded uppercase tracking-wider text-textMuted">{rules[0].category}</span>
                    <span className="text-xs px-2 py-1 bg-white/10 rounded font-bold text-textMain">Limit: {rules[0].limit} USDO</span>
                    <span className="text-xs px-2 py-1 bg-white/10 rounded capitalize text-textMuted">{rules[0].period}</span>
                  </div>
                </div>
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
          placeholder="Type a new spending rule here..."
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
