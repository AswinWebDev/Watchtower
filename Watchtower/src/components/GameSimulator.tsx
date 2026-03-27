import { useState } from 'react';
import { useStore } from '../store';
import { ShieldAlert, Coins, Gamepad2, Loader2 } from 'lucide-react';

export const GameSimulator = () => {
  const { walletAddress, attemptTransaction, refreshBalance } = useStore();
  const [betAmount, setBetAmount] = useState(0.2);
  const [result, setResult] = useState<'idle' | 'win' | 'loss' | 'blocked' | 'signing'>('idle');
  const [reason, setReason] = useState('');

  const handleBet = async () => {
    // 1. Check local AI Policy Guardrails first
    const success = attemptTransaction(betAmount, 'OnePlay Coin Flip');
    
    if (!success) {
      setResult('blocked');
      setReason("Transaction intercepted by Watchtower Guardian Vault. You have exceeded your daily spending limits set by your AI policy.");
      return;
    }

    if (!walletAddress) {
      setResult('blocked');
      setReason("Please connect your OneWallet to place a bet.");
      return;
    }

    setResult('signing');

    try {
      // 2. Prepare actual on-chain transaction
      const { Transaction } = await import('@onelabs/sui/transactions');
      const { getWallets } = await import('@mysten/wallet-standard');

      const tx = new Transaction();
      const amountInMist = betAmount * 1_000_000_000;
      
      const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
      tx.transferObjects([coin], walletAddress); // Send to self as a mock bet
      tx.setSender(walletAddress);

      // 3. Find OneWallet and execute
      const wallets = getWallets().get();
      const suiWallet = wallets.find((w: any) => 
        Object.keys(w.features || {}).some(f => f.startsWith('sui:'))
      );

      if (!suiWallet) throw new Error("No SUI-compatible OneWallet found");

      const accounts = (suiWallet as any).accounts || [];
      const signAndExecuteFeature = (suiWallet.features as any)['sui:signAndExecuteTransactionBlock'];
      
      if (!signAndExecuteFeature) throw new Error("Transaction executing feature not available in wallet");

      await signAndExecuteFeature.signAndExecuteTransactionBlock({
        account: accounts[0],
        transactionBlock: tx,
        options: { showEffects: true }
      });

      // 4. Update balance globally and show game result
      await refreshBalance();
      const won = Math.random() > 0.5;
      setResult(won ? 'win' : 'loss');

    } catch (err: any) {
      console.error('Wallet Error:', err);
      setResult('blocked');
      setReason(err.message || "User rejected the transaction or an error occurred.");
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-[1200px] mx-auto min-h-[500px]">
      <div className="w-full max-w-md metric-card bg-[#111] border-[#1f1f1f] p-8 relative">
        
        {/* Blocked Overlay */}
        {result === 'blocked' && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-16 h-16 rounded-xl bg-[#1e1111] border border-[#301616] flex items-center justify-center mb-6">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-[800] text-white mb-2 tracking-widest uppercase">TX BLOCKED</h3>
            <p className="text-[#888] text-[12px] leading-relaxed max-w-[80%] mx-auto">{reason}</p>
            <button 
              onClick={() => setResult('idle')}
              className="mt-8 px-6 py-2 bg-[#222] hover:bg-[#333] rounded-md text-white font-bold tracking-widest uppercase border border-[#333] transition-colors text-[11px]"
            >
              Acknowledge
            </button>
          </div>
        )}

        <div className="text-center mb-8 relative z-0">
          <div className="inline-flex items-center justify-center w-[48px] h-[48px] rounded-xl bg-[#1a1a1a] border border-[#2a2a2c] mb-4">
             <Gamepad2 className="w-[20px] h-[20px] text-white/50" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">OnePlay Simulator</h2>
          <p className="text-textMuted mt-1 text-[12px]">Simulate OneChain GameFi Interaction</p>
        </div>

        <div className="space-y-6 relative z-0">
          <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest">Bet Amount (OCT)</label>
            <div className="flex items-center bg-[#0a0a0a] rounded-lg p-1 border border-[#1f1f1f]">
              {[0.1, 0.2, 0.5, 1].map(amt => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`flex-1 py-2 text-[13px] font-bold rounded-md transition-colors ${betAmount === amt ? 'bg-white text-black' : 'text-textMuted hover:text-white hover:bg-[#1f1f1f]'}`}
                >
                  {amt}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#161616] rounded-md p-4 border border-[#262626] text-center">
            <p className="text-[11px] text-[#888] leading-relaxed">This simulates a generic GameFi bet. Watchtower evaluates all intents and <span className="text-primary font-bold">blocks</span> any tx exceeding configured AI Policy limits.</p>
          </div>

          <button 
            onClick={result === 'signing' ? undefined : handleBet}
            disabled={result === 'signing'}
            className="w-full py-3.5 rounded-md bg-primary hover:bg-primaryLight text-white font-[800] tracking-widest uppercase text-[12px] transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {result === 'signing' ? <Loader2 className="w-4 h-4 mr-2.5 animate-spin"/> : <Coins className="w-4 h-4 mr-2.5 opacity-80" strokeWidth={2.5}/>}
            {result === 'signing' ? 'Signing in Wallet...' : 'Place Bet'}
          </button>

          <div className="h-4 flex justify-center items-center">
             {result === 'win' && <p className="text-center text-white/90 font-bold tracking-widest text-[11px] uppercase">You Won <span className="text-primary">{betAmount * 2} OCT</span> 🎉</p>}
             {result === 'loss' && <p className="text-center text-textMuted font-bold tracking-widest text-[11px] uppercase">You lost {betAmount} OCT.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
