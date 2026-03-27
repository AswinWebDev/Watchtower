import { useState, useEffect } from 'react';
import { Shield, Activity, Wallet, MessageSquare, Gamepad2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AiPolicies } from './components/AiPolicies';
import { GameSimulator } from './components/GameSimulator';
import { useStore } from './store';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'simulator'>('dashboard');
  const { walletConnected, walletAddress, connectWallet, refreshBalance, showInstallModal, setShowInstallModal } = useStore();

  // Re-fetch real OCT balance on mount (handles reload with persisted wallet)
  useEffect(() => {
    if (walletConnected && walletAddress) {
      refreshBalance();
    }
  }, [walletConnected, walletAddress, refreshBalance]);
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-panel m-4 flex flex-col items-center py-8 z-10 hidden md:flex border-l border-white/10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/50 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-widest mb-10 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
          WATCHTOWER
        </h1>

        <nav className="w-full px-4 space-y-3">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
          >
            <Activity className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'ai' ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">AI Policies</span>
          </button>
          <button 
            onClick={() => setActiveTab('simulator')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'simulator' ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
          >
            <Gamepad2 className="w-5 h-5" />
            <span className="font-medium">OnePlay Simulator</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:pl-0 z-10 overflow-hidden">
        <header className="glass-panel h-20 mb-4 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-2xl font-semibold tracking-wide text-white/90 flex items-center">
            {activeTab === 'ai' ? 'Guardian AI Configurator' : activeTab === 'simulator' ? 'OnePlay Simulator' : 'Vault Dashboard'}
            <span className="ml-4 px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-xs uppercase tracking-widest rounded-md font-bold drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              OneChain Testnet
            </span>
          </h2>
          <button 
            onClick={connectWallet}
            className={`glass-button flex items-center space-x-2 ${walletConnected ? 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30 text-green-400' : ''}`}
          >
            <Wallet className="w-4 h-4" />
            <span>{walletConnected && walletAddress 
              ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
              : 'Connect OneWallet'}</span>
          </button>
        </header>

        {showInstallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-panel p-8 max-w-md w-full relative animate-in fade-in zoom-in-95 duration-200">
              <button onClick={() => setShowInstallModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">✕</button>
              <h3 className="text-2xl font-bold mb-2 text-white">OneWallet Required</h3>
              <p className="text-white/70 mb-6">
                To use Watchtower and secure your assets on the OneChain Testnet, install the OneWallet extension and acquire testnet tokens.
              </p>
              <div className="space-y-4">
                <a
                  href="https://chromewebstore.google.com/detail/onewallet/gclmcgmpkgblaglfokkaclneihpnbkli?hl=en"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium border border-white/10 transition-colors"
                >
                  Install OneWallet Extension
                </a>
                <a
                  href="https://onebox.onelabs.cc/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center w-full py-3 bg-primary/20 hover:bg-primary/30 text-primary font-medium rounded-lg border border-primary/30 transition-colors"
                >
                  Get Testnet USDO (OneBox UI)
                </a>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto pr-2 pb-4 pt-1">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'ai' && <AiPolicies />}
          {activeTab === 'simulator' && <GameSimulator />}
        </div>
      </main>
    </div>
  );
}

export default App;
