import { create } from 'zustand';

export interface GuardRule {
  id: string;
  description: string;
  category: string;
  limit: number;
  period: 'daily' | 'weekly';
  active: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  timestamp: Date;
  game: string;
  status: 'allowed' | 'blocked';
  reason?: string;
}

interface WatchtowerStore {
  walletAddress: string | null;
  walletConnected: boolean;
  showInstallModal: boolean;
  setShowInstallModal: (show: boolean) => void;
  totalBalance: number;
  usedDaily: number;
  rules: GuardRule[];
  forceMockConnection: () => void;
  setWallet: (address: string) => void;
  transactions: Transaction[];
  connectWallet: () => Promise<void>;
  addRule: (rule: Omit<GuardRule, 'id'>) => void;
  attemptTransaction: (amount: number, game: string) => boolean;
}

export const useStore = create<WatchtowerStore>()((set: any, get: any) => ({
  walletAddress: null,
  walletConnected: false,
  showInstallModal: false,
  setShowInstallModal: (show: boolean) => set({ showInstallModal: show }),
  totalBalance: 0, // Genuine production zero-state
  usedDaily: 0,
  forceMockConnection: () => {}, // Deprecated for production
  setWallet: (address: string) => set({ walletConnected: true, walletAddress: address, showInstallModal: false }),
  rules: [],
  transactions: [],
  connectWallet: async () => {
    try {
      // Log what's available on window for debugging
      const oneKeys = Object.keys(window).filter(k => 
        k.toLowerCase().includes('one') || k.toLowerCase().includes('sui') || k.toLowerCase().includes('wallet')
      );
      console.log('Wallet-related window keys:', oneKeys);

      let address = '';

      // Strategy 1: Wallet Standard registry (works for Sui-based wallets)
      try {
        const { getWallets } = await import('@mysten/wallet-standard');
        // Give extension 1500ms to register via window events
        await new Promise(r => setTimeout(r, 1500));
        const wallets = getWallets().get();
        console.log('Registered wallets:', wallets.map((w: any) => w.name));
        if (wallets.length > 0) {
          const wallet = wallets[0];
          const feature = (wallet.features as any)?.['standard:connect'];
          if (feature?.connect) {
            // Do NOT pass { silent: false } — OneWallet crashes trying to destructure chainType from it
            const result = await feature.connect();
            address = result?.accounts?.[0]?.address || '';
            console.log('Wallet standard connect result:', result);
          }
        }
      } catch (e) {
        console.warn('Wallet standard strategy failed:', e);
      }

      // Strategy 2: Direct window.onechainWallet — confirmed injected by OneWallet extension
      if (!address) {
        const windowAny = window as any;
        const wallet = windowAny.onechainWallet;
        if (wallet) {
          try {
            // Sui-style flow: requestPermissions → getAccounts
            console.log('Using window.onechainWallet directly...');
            if (typeof wallet.requestPermissions === 'function') {
              await wallet.requestPermissions();
            }
            if (typeof wallet.getAccounts === 'function') {
              const accounts = await wallet.getAccounts();
              console.log('onechainWallet.getAccounts() returned:', accounts);
              address = accounts?.[0]?.address || accounts?.[0] || '';
            }
            // Fallback: try connect() if getAccounts didn't work
            if (!address && typeof wallet.connect === 'function') {
              const res = await wallet.connect();
              console.log('onechainWallet.connect() returned:', res);
              address = res?.address || res?.accountAddress || res?.accounts?.[0]?.address || '';
            }
          } catch (err) {
            console.warn('window.onechainWallet failed:', err);
          }
        }
      }

      if (!address) {
        console.warn('No wallet detected. Showing install modal.');
        set({ showInstallModal: true });
        return;
      }

      set({ walletConnected: true, walletAddress: address, showInstallModal: false });
    } catch (e) {
      console.error('Wallet connection failed:', e);
      set({ showInstallModal: true });
    }
  },
  addRule: (rule: any) => set((state: any) => ({
    rules: [{ ...rule, id: Math.random().toString(36).substr(2, 9) }, ...state.rules]
  })),
  attemptTransaction: (amount: any, game: any) => {
    const state = get();
    // find active GameFi daily rule
    const gameRule = state.rules.find((r: any) => r.category === 'GameFi' && r.period === 'daily' && r.active);
    
    let isBlocked = false;
    let reason = '';

    if (gameRule) {
      if (state.usedDaily + amount > gameRule.limit) {
        isBlocked = true;
        reason = `Exceeds daily ${gameRule.category} limit of ${gameRule.limit} USDO.`;
      }
    }

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      timestamp: new Date(),
      game,
      status: isBlocked ? 'blocked' : 'allowed',
      reason
    };

    set((state: any) => ({
      transactions: [newTx, ...state.transactions],
      usedDaily: isBlocked ? state.usedDaily : state.usedDaily + amount,
      totalBalance: isBlocked ? state.totalBalance : state.totalBalance - amount
    }));

    return !isBlocked;
  }
}));

if (typeof window !== 'undefined') {
  (window as any).forceConnect = (address: string = "0xeb4dc...3780") => {
    useStore.setState({ walletConnected: true, walletAddress: address, showInstallModal: false, totalBalance: 0 });
    console.log("🚀 DevMode: Forced Connection to", address);
  };
}
