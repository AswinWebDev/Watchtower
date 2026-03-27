import { useState } from 'react';
import { useStore } from '../store';
import { ShieldAlert, Coins, Gamepad2 } from 'lucide-react';

export const GameSimulator = () => {
  const { attemptTransaction } = useStore();
  const [betAmount, setBetAmount] = useState(0.2);
  const [result, setResult] = useState<'idle' | 'win' | 'loss' | 'blocked'>('idle');
  const [reason, setReason] = useState('');

  const handleBet = () => {
    const success = attemptTransaction(betAmount, 'OnePlay Coin Flip');
    
    if (!success) {
      setResult('blocked');
      setReason("Transaction intercepted by Watchtower Guardian Vault. You have exceeded your daily spending limits set by your AI policy.");
      return;
    }

    const won = Math.random() > 0.5;
    setResult(won ? 'win' : 'loss');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center -mt-10">
      <div className="w-full max-w-md glass-panel p-8 relative overflow-hidden">
        
        {/* Blocked Overlay */}
        {result === 'blocked' && (
          <div className="absolute inset-0 bg-red-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-10 transition-all">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-widest">TX BLOCKED</h3>
            <p className="text-red-200 text-sm leading-relaxed">{reason}</p>
            <button 
              onClick={() => setResult('idle')}
              className="mt-8 px-8 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-white font-medium border border-white/20 transition-all"
            >
              Acknowledge
            </button>
          </div>
        )}

        <div className="text-center mb-8 relative z-0">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-500/20 border border-purple-500/30 mb-4 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
             <Gamepad2 className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-purple-500">OnePlay Simulator</h2>
          <p className="text-textMuted mt-1 text-sm">Test Watchtower's policy enforcement on OneChain GameFi</p>
        </div>

        <div className="space-y-6 relative z-0">
          <div className="flex flex-col space-y-3">
            <label className="text-xs font-semibold text-textMuted uppercase tracking-widest pl-1">Bet Amount (OCT)</label>
            <div className="flex items-center bg-black/40 rounded-xl p-1.5 border border-white/5">
              {[0.1, 0.2, 0.5, 1].map(amt => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${betAmount === amt ? 'bg-white/15 text-white shadow-md' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                >
                  {amt} OCT
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-white/5">
            <p className="text-xs text-textMuted mb-1">How it works</p>
            <p className="text-xs text-white/70">This simulates a OnePlay GameFi bet. If you have set a spending limit via AI Policies or the autonomous agent, Watchtower will <span className="text-red-400 font-semibold">block</span> any bet that exceeds your daily limits.</p>
          </div>

          <button 
            onClick={handleBet}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center tracking-wider border border-purple-400/50"
          >
            <Coins className="w-5 h-5 mr-2" />
            PLACE BET
          </button>

          <div className="h-6 flex justify-center items-center">
             {result === 'win' && <p className="text-center text-green-400 font-bold">You Won {betAmount * 2} OCT! 🎉</p>}
             {result === 'loss' && <p className="text-center text-red-400 font-bold">You lost {betAmount} OCT.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
