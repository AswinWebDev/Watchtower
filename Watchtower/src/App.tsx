import { useState, useEffect } from 'react';
import { Shield, Activity, Wallet, MessageSquare, Gamepad2, LogOut } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { AiPolicies } from './components/AiPolicies';
import { GameSimulator } from './components/GameSimulator';
import { LandingPage } from './components/LandingPage';
import { useStore } from './store';

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai' | 'simulator'>('dashboard');
  const { walletConnected, walletAddress, disconnectWallet, refreshBalance, showInstallModal, setShowInstallModal } = useStore();

  useEffect(() => {
    if (walletConnected && walletAddress) {
      refreshBalance();
      const interval = setInterval(refreshBalance, 3000);
      return () => clearInterval(interval);
    }
  }, [walletConnected, walletAddress, refreshBalance]);

  const InstallModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="bg-card border border-cardBorder p-8 max-w-md w-full rounded-xl animate-in fade-in zoom-in-95 duration-200">
        <button onClick={() => setShowInstallModal(false)} className="absolute top-4 right-4 text-textMuted hover:text-white transition-colors">✕</button>
        <h3 className="text-xl font-bold mb-3 text-white flex items-center"><Shield className="w-5 h-5 mr-3 text-primary" /> OneWallet Required</h3>
        <p className="text-textMuted mb-6 text-sm leading-relaxed">
          To use Watchtower and secure your assets on the OneChain Testnet, install the OneWallet extension and acquire testnet tokens.
        </p>
        <div className="space-y-3">
          <a
            href="https://chromewebstore.google.com/detail/onewallet/gclmcgmpkgblaglfokkaclneihpnbkli?hl=en"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center w-full py-3 bg-white/5 hover:bg-white/10 rounded-md text-white font-medium border border-cardBorder transition-colors text-sm"
          >
            Install OneWallet Extension
          </a>
          <a
            href="https://onebox.onelabs.cc/dashboard"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center w-full py-3 bg-primary hover:bg-primaryLight text-white font-bold rounded-md transition-colors text-sm"
          >
            Get Testnet OCT (OneBox UI)
          </a>
        </div>
      </div>
    </div>
  );

  if (!walletConnected) {
    return (
      <>
        <LandingPage />
        {showInstallModal && <InstallModal />}
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {showInstallModal && <InstallModal />}
      
      {/* Sidebar matching the image exactly */}
      <aside className="w-[260px] bg-sidebar border-r border-[#2a2a2c] flex flex-col pt-10 px-4 z-10 shrink-0 hidden md:flex">
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-[14px] bg-[#222224] border border-[#333336] flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-[14px] font-[800] tracking-[0.15em] text-white">
            WATCHTOWER
          </h1>
        </div>

        <nav className="w-full space-y-1 mt-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'text-primary bg-primary/10 font-semibold' : 'text-textMuted hover:text-white hover:bg-white/5 font-medium'}`}
          >
            <Activity className="w-[18px] h-[18px]" strokeWidth={2} />
            <span className="text-[13px] tracking-wide">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'ai' ? 'text-primary bg-primary/10 font-semibold' : 'text-textMuted hover:text-white hover:bg-white/5 font-medium'}`}
          >
            <MessageSquare className="w-[18px] h-[18px]" strokeWidth={2} />
            <span className="text-[13px] tracking-wide">AI Policies</span>
          </button>
          <button 
            onClick={() => setActiveTab('simulator')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'simulator' ? 'text-primary bg-primary/10 font-semibold' : 'text-textMuted hover:text-white hover:bg-white/5 font-medium'}`}
          >
            <Gamepad2 className="w-[18px] h-[18px]" strokeWidth={2} />
            <span className="text-[13px] tracking-wide">OnePlay App</span>
          </button>
        </nav>
      </aside>

      {/* Main Content matching image exactly */}
      <main className="flex-1 flex flex-col p-6 overflow-hidden bg-[#050505]">
        <header className="metric-card bg-[#111] border-[#1f1f1f] h-[72px] flex items-center justify-between px-6 shrink-0 mb-6 w-full max-w-[1200px] mx-auto rounded-xl">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-bold text-white tracking-wide">
              {activeTab === 'ai' ? 'Guardian AI Configurator' : activeTab === 'simulator' ? 'OnePlay Environment' : 'Vault Dashboard'}
            </h2>
            <span className="px-2.5 py-1 bg-[#222] border border-[#333] text-textMuted text-[10px] font-bold uppercase tracking-widest rounded uppercase">
              ONECHAIN TESTNET
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white text-black px-4 py-2 rounded-md text-[13px] font-bold">
              <Wallet className="w-[14px] h-[14px] text-black" />
              <span>{walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connected'}</span>
            </div>
            <button 
              onClick={disconnectWallet}
              title="Disconnect"
              className="p-2.5 bg-[#1a1a1a] hover:bg-primary/20 border border-[#333] hover:border-primary/50 text-[#888] hover:text-primary transition-colors rounded-md"
            >
              <LogOut className="w-[14px] h-[14px]" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto w-full max-w-[1200px] mx-auto custom-scrollbar">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'ai' && <AiPolicies />}
          {activeTab === 'simulator' && <GameSimulator />}
        </div>
      </main>
    </div>
  );
}

export default App;
