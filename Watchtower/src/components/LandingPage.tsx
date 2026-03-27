import { Shield, Lock, Wallet, ArrowRight, Activity, Cpu, Code } from 'lucide-react';
import { useStore } from '../store';

export function LandingPage() {
  const { connectWallet } = useStore();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-primary/30">
      {/* Navbar Mimal */}
      <nav className="w-full px-6 py-5 flex items-center justify-between z-10 relative max-w-[1200px] mx-auto border-b border-[#1f1f1f]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#111] border border-[#262626] flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" strokeWidth={2} />
          </div>
          <span className="text-[13px] font-[800] tracking-[0.2em] text-white">WATCHTOWER</span>
        </div>
        <button 
          onClick={connectWallet}
          className="flex items-center px-4 py-2 bg-white text-black hover:bg-neutral-200 transition-colors rounded-md text-[12px] font-bold tracking-wide"
        >
          <Wallet className="w-3.5 h-3.5 mr-2" />
          Connect Wallet
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-[1200px] mx-auto px-6 pt-32 pb-24 text-center">
        <div className="inline-flex items-center bg-[#111] border border-[#262626] rounded-full px-4 py-1.5 mb-10">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
          <span className="text-[11px] font-bold tracking-widest text-white/70 uppercase">OneChain Testnet Live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-[800] tracking-tight mb-8 leading-[1.1]">
          The Default Guardian <br/> for the <span className="text-primary align-baseline">OneChain</span> Ecosystem.
        </h1>
        
        <p className="text-lg text-textMuted max-w-2xl mx-auto mb-12 leading-relaxed">
          Watchtower is an autonomous security agent that protects your OneWallet. 
          It analyzes threats in real-time, limits your spending automatically, and shields you from bad actors.
        </p>
        
        <button 
          onClick={connectWallet}
          className="inline-flex items-center px-8 py-4 bg-primary hover:bg-primaryLight text-white rounded-md text-[14px] font-bold tracking-wide transition-all group"
        >
          <Shield className="w-4 h-4 mr-3" strokeWidth={2.5}/>
          Initialize Vault
          <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </main>

      {/* Architecture / How it Works */}
      <section className="bg-[#050505] border-t border-[#1f1f1f] py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-[800] tracking-tight mb-4">How Watchtower Works</h2>
            <p className="text-textMuted max-w-xl mx-auto text-sm leading-relaxed">A seamless, unified security layer sitting directly between your wallet and OneChain dApps.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="metric-card bg-[#111] border-[#1f1f1f] p-8">
              <div className="w-12 h-12 bg-[#1a1a1a] border border-[#262626] rounded-lg mb-6 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white/80" />
              </div>
              <h3 className="text-[15px] font-bold mb-3">1. Connect & Sync</h3>
              <p className="text-[13px] text-textMuted leading-relaxed">
                Watchtower links to your standard OneWallet. It immediately fetches your real testnet OCT balance and scans your on-chain history.
              </p>
            </div>

            <div className="metric-card bg-[#111] border-[#1f1f1f] p-8 pointer-events-none border-t-primary/50 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="w-12 h-12 bg-[#1a1a1a] border border-[#262626] rounded-lg mb-6 flex items-center justify-center relative z-10">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-[15px] font-bold mb-3 relative z-10">2. Autonomous AI Limits</h3>
              <p className="text-[13px] text-textMuted leading-relaxed relative z-10">
                Venice AI analyzes gaming and DeFi behaviors. Use natural language to deploy spending rules (e.g. "Limit daily OnePlay bets to 1 OCT").
              </p>
            </div>

            <div className="metric-card bg-[#111] border-[#1f1f1f] p-8">
               <div className="w-12 h-12 bg-[#1a1a1a] border border-[#262626] rounded-lg mb-6 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white/80" />
              </div>
              <h3 className="text-[15px] font-bold mb-3">3. On-Chain Enforcement</h3>
              <p className="text-[13px] text-textMuted leading-relaxed">
                Rules are signed cryptographically. Watchtower blocks any transaction—DEX swaps or GameFi bets—that violate your security threshold.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 text-center text-[12px] font-medium text-[#444] border-t border-[#1f1f1f] bg-black">
        <p className="flex items-center justify-center">
          <Code className="w-3.5 h-3.5 mr-2" />
          Built for the OneChain Hackathon
        </p>
      </footer>
    </div>
  );
}
