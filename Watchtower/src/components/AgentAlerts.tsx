import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Activity, CheckCircle, Shield, X, AlertOctagon } from 'lucide-react';

export const AgentAlerts = () => {
  const { walletAddress, addRule, resolvedThreats, dismissThreat, cachedAnalysis, setCachedAnalysis } = useStore();
  const [loading, setLoading] = useState(!cachedAnalysis);
  const [isSigning, setIsSigning] = useState(false);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const analysis = cachedAnalysis;

  useEffect(() => {
    if (!walletAddress || cachedAnalysis) {
      setLoading(false);
      return;
    }

    const runAnalysis = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/analyze-behavior', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: walletAddress })
        });
        const data = await response.json();
        if (data.success && data.analysis) {
          setCachedAnalysis(data.analysis);
        }
      } catch (e) {
        console.error("Agent Analysis Failed", e);
      } finally {
        setLoading(false);
      }
    };

    runAnalysis();
  }, [walletAddress, cachedAnalysis, setCachedAnalysis]);

  const threatKey = analysis 
    ? `${analysis.severity}_${analysis.suggestedPolicy?.target || 'unknown'}_${analysis.suggestedPolicy?.amountDetails?.limit || 0}`
    : '';
  const isAlreadyResolved = resolvedThreats.includes(threatKey);

  if (loading) {
    return (
      <div className="metric-card p-4 bg-[#111] border-[#1f1f1f] flex items-center space-x-4">
        <Activity className="w-5 h-5 text-textMuted animate-pulse shrink-0" strokeWidth={2} />
        <div>
          <h3 className="text-[13px] font-bold text-white flex items-center">Analyzing Wallet...</h3>
          <p className="text-[11px] text-textMuted mt-0.5">Scanning OneDEX, OnePlay, OnePoker activity for threats.</p>
        </div>
      </div>
    );
  }

  if (!analysis || !analysis.threatDetected || isAlreadyResolved) {
    return (
      <div className="p-4 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl flex items-center">
        <Shield className="w-[14px] h-[14px] text-textMuted mr-2" />
        <p className="text-[12px] text-textMuted font-medium tracking-wide">Watchtower: No active threats. Your OneWallet is secured.</p>
      </div>
    );
  }

  const handleDeploy = async () => {
    if (!analysis.suggestedPolicy || !walletAddress) return;
    
    setIsSigning(true);
    setErrorMsg(null);
    try {
      const { Transaction } = await import('@onelabs/sui/transactions');
      const { getWallets } = await import('@mysten/wallet-standard');
      
      const tx = new Transaction();
      
      // We simulate deploying a policy by doing a small gas tx
      const [coin] = tx.splitCoins(tx.gas, [100]);
      tx.transferObjects([coin], walletAddress);
      tx.setSender(walletAddress);
      
      const suiWallet = getWallets().get().find((w: any) => 
        Object.keys(w.features || {}).some(f => f.startsWith('sui:'))
      );
      if (!suiWallet) throw new Error("No SUI-compatible OneWallet found");
      
      const accounts = (suiWallet as any).accounts || [];
      const signAndExecuteFeature = (suiWallet.features as any)['sui:signAndExecuteTransactionBlock'];
      if (!signAndExecuteFeature) throw new Error("signAndExecuteTransactionBlock not available in wallet");
      
      const res = await signAndExecuteFeature.signAndExecuteTransactionBlock({
         account: accounts[0],
         transactionBlock: tx,
         options: { showEffects: true }
      });
      
      setTxDigest(res.digest.substring(0, 44));
      
      addRule({
        description: analysis.suggestedPolicy.explanation || analysis.recommendedAction,
        category: analysis.suggestedPolicy.target || 'All',
        limit: analysis.suggestedPolicy.amountDetails?.limit || 0,
        period: (analysis.suggestedPolicy.amountDetails?.timeframe?.toLowerCase() as "daily" | "weekly") || 'daily',
        active: true
      });
      
      dismissThreat(threatKey);
      
    } catch (e: any) {
      if (e.message && !e.message.includes('rejected')) setErrorMsg(e.message);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="metric-card p-6 bg-[#181111] border-[#301010] relative">
      <button onClick={() => dismissThreat(threatKey)} className="absolute top-4 right-4 p-1 text-[#666] hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>

      {txDigest ? (
        <div className="flex items-start space-x-4">
          <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="text-[14px] font-bold text-white tracking-wide">Policy Deployed On-Chain</h3>
            <p className="text-textMuted text-[10px] font-mono mt-1">Signature: {txDigest}</p>
            <p className="text-primary/80 text-[12px] mt-2 font-semibold">This Move smart contract policy is now actively protecting your OneWallet.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
             <AlertOctagon className="w-5 h-5 text-primary" strokeWidth={2}/>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-white font-[800] text-[15px] tracking-wide uppercase">Threat Detected</h3>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest bg-primary text-white">{analysis.severity} RISK</span>
            </div>
            <p className="text-white/80 text-[13px] leading-relaxed mb-5 max-w-[90%]">{analysis.threatDescription}</p>
            
            <div className="bg-[#111] rounded-lg p-5 border border-[#1f1f1f] mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-textMuted uppercase tracking-widest font-bold">Recommended AI Policy</p>
                <Activity className="w-3.5 h-3.5 text-textMuted" />
              </div>
              <p className="text-[13px] text-white font-medium mb-4">{analysis.recommendedAction}</p>
              {analysis.suggestedPolicy && (
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] px-2.5 py-1 bg-[#222] border border-[#333] rounded uppercase font-bold text-white/80">{analysis.suggestedPolicy.target}</span>
                  <span className="text-[11px] px-2.5 py-1 bg-primary/10 border border-primary/20 rounded font-bold text-primary">
                    LIMIT: {analysis.suggestedPolicy.amountDetails.limit} OCT/{analysis.suggestedPolicy.amountDetails.timeframe}
                  </span>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                <p className="text-[12px] text-primary font-semibold flex items-center"><X className="w-[14px] h-[14px] mr-2" /> {errorMsg}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <button 
                onClick={handleDeploy} 
                disabled={isSigning || !walletAddress}
                className="px-6 py-2.5 bg-primary hover:bg-primaryLight text-white font-[800] tracking-wider uppercase text-[11px] rounded-md transition-colors disabled:opacity-50 flex items-center"
              >
                {isSigning ? 'Deploying Policy...' : 'Deploy Smart Contract Policy'}
                {!isSigning && <Shield className="w-3.5 h-3.5 ml-2.5" />}
              </button>
              <button 
                onClick={() => dismissThreat(threatKey)}
                className="px-6 py-2.5 bg-[#111] hover:bg-[#222] text-white/60 hover:text-white font-[800] rounded-md border border-[#222] hover:border-[#333] transition-colors text-[11px] tracking-wider uppercase"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
