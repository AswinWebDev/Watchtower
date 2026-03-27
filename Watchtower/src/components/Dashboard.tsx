import { useStore } from '../store';
import { ShieldCheck, ShieldAlert, Activity, ArrowDownRight, Zap, TrendingUp, Gamepad2 } from 'lucide-react';
import { AgentAlerts } from './AgentAlerts';

export const Dashboard = () => {
  const { totalBalance, usedDaily, rules, transactions } = useStore();
  
  const dailyRule = rules.find((r: any) => (r.category === 'GameFi' || r.category === 'All') && r.period === 'daily' && r.active);
  const dailyLimit = dailyRule ? dailyRule.limit : 0;
  const progress = dailyLimit > 0 ? Math.min((usedDaily / dailyLimit) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      {/* Proactive Agent Analysis */}
      <AgentAlerts />

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <h3 className="text-textMuted text-sm font-medium">Total Shielded Balance</h3>
          <p className="text-4xl font-bold mt-2 z-10">{totalBalance.toFixed(2)} <span className="text-xl text-primary font-normal">OCT</span></p>
          <div className="mt-4 flex items-center text-sm text-green-400 font-medium z-10">
            <ShieldCheck className="w-4 h-4 mr-1" />
            Protected by Guardian Vault
          </div>
        </div>

        <div className="glass-panel p-6 col-span-2 relative overflow-hidden">
           <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl -mr-10 -mb-10"></div>
          <h3 className="text-textMuted text-sm font-medium mb-4">Daily Spending Limit Usage</h3>
          <div className="flex justify-between items-end mb-2 z-10 relative">
            <div>
              <p className="text-3xl font-bold">{usedDaily.toFixed(2)} <span className="text-lg text-textMuted font-normal">/ {dailyLimit} OCT</span></p>
            </div>
            <div className="text-right">
              {dailyLimit === 0 ? (
                <span className="text-yellow-400 flex items-center font-medium"><ShieldAlert className="w-4 h-4 mr-1"/> No Limit Set</span>
              ) : progress >= 100 ? (
                <span className="text-red-400 flex items-center font-medium"><ShieldAlert className="w-4 h-4 mr-1"/> Limits Reached</span>
              ) : (
                <span className="text-accent font-medium">{(100 - progress).toFixed(0)}% Remaining</span>
              )}
            </div>
          </div>
          <div className="w-full bg-white/5 rounded-full h-3 mb-2 overflow-hidden border border-white/5 z-10 relative">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${progress > 80 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-primary to-accent'}`} 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* OneChain Product Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 flex items-center space-x-3 border border-white/5 hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">OneDEX</p>
            <p className="text-xs text-green-400">Monitoring swaps</p>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center space-x-3 border border-white/5 hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">OnePlay</p>
            <p className="text-xs text-green-400">Monitoring bets</p>
          </div>
        </div>
        <div className="glass-panel p-4 flex items-center space-x-3 border border-white/5 hover:border-primary/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center border border-yellow-500/30">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white/90">OnePoker</p>
            <p className="text-xs text-green-400">Monitoring stakes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">Active AI Policies</h3>
          <div className="space-y-3">
            {rules.length === 0 && (
              <p className="text-sm text-textMuted italic">No policies deployed yet. Use the AI Policies tab to create spending rules.</p>
            )}
            {rules.map((rule: any) => (
              <div key={rule.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-start justify-between hover:bg-white/10 transition-colors cursor-default">
                <div>
                  <p className="font-medium text-sm text-white/90 leading-snug">{rule.description}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 uppercase tracking-wider font-semibold text-textMuted">{rule.category}</span>
                    {rule.limit > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 font-bold text-primary">{rule.limit} OCT/{rule.period}</span>
                    )}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full shrink-0 ml-4 mt-1 ${rule.active ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-500'}`}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2 flex items-center justify-between">
            Recent Activity
            <Activity className="w-4 h-4 text-primary" />
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.length === 0 && (
              <p className="text-sm text-textMuted italic">No transactions yet. Use the OnePlay Simulator to test your policies.</p>
            )}
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex flex-col p-3 border-l-2 border-white/10 bg-white/5 rounded-r-lg hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm text-white/90">{tx.game}</span>
                  <span className={`font-bold flex items-center ${tx.status === 'allowed' ? 'text-white' : 'text-red-400'}`}>
                    {tx.status === 'allowed' ? <ArrowDownRight className="w-3 h-3 mr-1 text-primary"/> : <ShieldAlert className="w-3 h-3 mr-1"/>}
                    {tx.amount} OCT
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-textMuted">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  <span className={`uppercase font-bold tracking-wider ${tx.status === 'allowed' ? 'text-green-400' : 'text-red-500'}`}>{tx.status}</span>
                </div>
                {tx.reason && <p className="text-xs text-red-300/80 mt-2 bg-red-950/30 p-2 rounded border border-red-500/20 italic">{tx.reason}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
