import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export interface ThreatAnalysis {
  threatDetected: boolean;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  threatDescription: string;
  recommendedAction: string;
  suggestedPolicy?: {
    action: string;
    target: string;
    amountDetails: { limit: number; timeframe: string };
    explanation: string;
  } | null;
}

interface WatchtowerStore {
  walletAddress: string | null;
  walletConnected: boolean;
  showInstallModal: boolean;
  setShowInstallModal: (show: boolean) => void;
  totalBalance: number;
  usedDaily: number;
  rules: GuardRule[];
  resolvedThreats: string[];
  cachedAnalysis: ThreatAnalysis | null;
  transactions: Transaction[];
  connectWallet: () => Promise<void>;
  addRule: (rule: Omit<GuardRule, 'id'>) => void;
  dismissThreat: (threatKey: string) => void;
  setCachedAnalysis: (analysis: ThreatAnalysis) => void;
  attemptTransaction: (amount: number, game: string) => boolean;
  refreshBalance: () => Promise<void>;
  setWallet: (address: string) => void;
  forceMockConnection: () => void;
}

export const useStore = create<WatchtowerStore>()(
  persist(
    (set, get) => ({
      walletAddress: '',
      walletConnected: false,
      showInstallModal: false,
      setShowInstallModal: (show: boolean) => set({ showInstallModal: show }),
      totalBalance: 0,
      usedDaily: 0,
      forceMockConnection: () => {},
      setWallet: (address: string) => set({ walletConnected: true, walletAddress: address, showInstallModal: false }),
      rules: [],
      resolvedThreats: [],
      cachedAnalysis: null,
      transactions: [],

      dismissThreat: (threatKey: string) => set((state) => ({
        resolvedThreats: [...new Set([...state.resolvedThreats, threatKey])]
      })),

      setCachedAnalysis: (analysis: ThreatAnalysis) => set({ cachedAnalysis: analysis }),

      // Fetch real OCT balance from OneChain testnet
      refreshBalance: async () => {
        const address = get().walletAddress;
        if (!address) return;
        try {
          const { getFullnodeUrl } = await import('@onelabs/sui/client');
          const res = await fetch(getFullnodeUrl('testnet'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0', id: 1,
              method: 'suix_getBalance',
              params: [address, '0x2::oct::OCT']
            })
          });
          const data = await res.json();
          if (data.result?.totalBalance) {
            set({ totalBalance: parseInt(data.result.totalBalance) / 1_000_000_000 });
          }
        } catch (e) {
          console.warn('Failed to fetch OCT balance:', e);
        }
      },

      connectWallet: async () => {
        try {
          let address = '';

          // Strategy 1: Wallet Standard — find the SUI-chain OneWallet
          try {
            const { getWallets } = await import('@mysten/wallet-standard');
            await new Promise(r => setTimeout(r, 1500));
            const wallets = getWallets().get();
            console.log('Registered wallets:', wallets.map((w: any) => `${w.name}(${(w as any).chains})`));
            
            const suiWallet = wallets.find((w: any) => {
              const features = Object.keys(w.features || {});
              return features.some(f => f.startsWith('sui:'));
            });

            if (suiWallet) {
              console.log('Found SUI-chain OneWallet');
              const feature = (suiWallet.features as any)?.['standard:connect'];
              if (feature?.connect) {
                const result = await feature.connect();
                address = result?.accounts?.[0]?.address || '';
              }
              if (!address) {
                const accounts = (suiWallet as any).accounts || [];
                if (accounts.length > 0) address = accounts[0].address || '';
              }
            }
          } catch (e) {
            console.warn('Wallet standard strategy failed:', e);
          }

          // Strategy 2: Direct window.onechainWallet
          if (!address) {
            const wallet = (window as any).onechainWallet;
            if (wallet) {
              try {
                if (typeof wallet.requestPermissions === 'function') await wallet.requestPermissions();
                if (typeof wallet.getAccounts === 'function') {
                  const accounts = await wallet.getAccounts();
                  address = accounts?.[0]?.address || accounts?.[0] || '';
                }
                if (!address && typeof wallet.connect === 'function') {
                  const res = await wallet.connect();
                  address = res?.address || res?.accountAddress || res?.accounts?.[0]?.address || '';
                }
              } catch (err) { console.warn('window.onechainWallet failed:', err); }
            }
          }

          if (!address) {
            set({ showInstallModal: true });
            return;
          }

          // Fetch real OCT balance from OneChain testnet
          let balance = 0;
          try {
            const { getFullnodeUrl } = await import('@onelabs/sui/client');
            const res = await fetch(getFullnodeUrl('testnet'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0', id: 1,
                method: 'suix_getBalance',
                params: [address, '0x2::oct::OCT']
              })
            });
            const data = await res.json();
            if (data.result?.totalBalance) {
              balance = parseInt(data.result.totalBalance) / 1_000_000_000;
            }
          } catch (e) {
            console.warn('Failed to fetch OCT balance:', e);
          }

          set({ walletConnected: true, walletAddress: address, showInstallModal: false, totalBalance: balance });
        } catch (e) {
          console.error('Wallet connection failed:', e);
          set({ showInstallModal: true });
        }
      },

      addRule: (rule: Omit<GuardRule, 'id'>) => set((state) => ({
        rules: [{ ...rule, id: Math.random().toString(36).substr(2, 9) }, ...state.rules]
      })),

      attemptTransaction: (amount: number, game: string) => {
        const state = get();
        // Check ALL matching rules (GameFi, DeFi, All)
        const matchingRule = state.rules.find((r) => 
          (r.category === 'GameFi' || r.category === 'All') && r.period === 'daily' && r.active
        );

        let isBlocked = false;
        let reason = '';

        if (matchingRule) {
          if (state.usedDaily + amount > matchingRule.limit) {
            isBlocked = true;
            reason = `Watchtower blocked: Exceeds ${matchingRule.category} daily limit of ${matchingRule.limit} OCT. Policy: "${matchingRule.description}"`;
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

        // NOTE: totalBalance stays as real on-chain OCT balance — simulator doesn't modify it
        // usedDaily tracks simulated spending for policy enforcement
        set((state) => ({
          transactions: [newTx, ...state.transactions],
          usedDaily: isBlocked ? state.usedDaily : state.usedDaily + amount,
        }));

        return !isBlocked;
      }
    }),
    {
      name: 'watchtower-storage',
      partialize: (state) => ({
        walletConnected: state.walletConnected,
        walletAddress: state.walletAddress,
        totalBalance: state.totalBalance,
        usedDaily: state.usedDaily,
        rules: state.rules,
        transactions: state.transactions,
        resolvedThreats: state.resolvedThreats,
      }),
    }
  )
);
