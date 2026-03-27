import { useStore } from '../store';
import { ShieldCheck, ShieldAlert, Activity, ArrowDownRight, Zap, TrendingUp, Gamepad2, Shield } from 'lucide-react';
import { AgentAlerts } from './AgentAlerts';

export const Dashboard = () => {
  const { totalBalance, usedDaily, rules, transactions } = useStore();
  
  const dailyRule = rules.find((r: any) => r.period === 'daily' && r.active);
  const dailyLimit = dailyRule ? dailyRule.limit : 0;
  const progress = dailyLimit > 0 ? Math.min((usedDaily / dailyLimit) * 100, 100) : 0;

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto">
      {/* Top Banner (Agent Core Scanning) */}
      <div className="metric-card p-4 flex items-center space-x-4 border-[#1f1f1f] bg-[#111]">
        <Activity className="w-5 h-5 text-primary" />
        <div>
          <h3 className="text-[13px] font-bold text-white flex items-center">
            <Shield className="w-[14px] h-[14px] mr-2 text-white/50" />
            Agent Core Active
          </h3>
          <p className="text-[11px] text-textMuted mt-0.5">Watching OneDEX, OnePlay, OnePoker activity for threats.</p>
        </div>
      </div>

      <AgentAlerts />

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Shielded Balance */}
        <div className="metric-card p-6 border-[#1f1f1f] bg-[#111] flex flex-col justify-between h-[160px]">
          <h3 className="text-[11px] font-bold text-textMuted uppercase tracking-widest mb-2">Total Shielded Balance</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-[800] text-white tracking-tight">{totalBalance.toFixed(2)}</span>
            <span className="text-xl font-bold text-primary">OCT</span>
          </div>
          <div className="flex items-center text-[12px] text-white/60 font-semibold mt-auto pt-4">
            <ShieldCheck className="w-[14px] h-[14px] mr-1.5 text-primary" />
            Protected by Guardian Vault
          </div>
        </div>

         {/* Daily Spending Limit Usage */}
        <div className="metric-card p-6 border-[#1f1f1f] bg-[#111] flex flex-col justify-between h-[160px]">
           <h3 className="text-[11px] font-bold text-textMuted uppercase tracking-widest mb-2">Daily Spending Limit Usage</h3>
           <div className="flex justify-between items-end mb-4">
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-[800] text-white tracking-tight">{usedDaily.toFixed(2)}</span>
              <span className="text-sm font-bold text-textMuted">{dailyLimit > 0 ? `/ ${dailyLimit} OCT` : 'OCT Spent Today'}</span>
            </div>
            
            {dailyLimit === 0 ? (
              <span className="text-[12px] text-textMuted font-bold flex items-center tracking-wide">
                <ShieldAlert className="w-[14px] h-[14px] mr-1.5 text-primary/50"/> No Policy Set
              </span>
            ) : progress >= 100 ? (
              <span className="text-[12px] text-primary font-bold flex items-center tracking-wide">
                <ShieldAlert className="w-[14px] h-[14px] mr-1.5"/> Limits Reached
              </span>
            ) : (
                <span className="text-[12px] text-white/80 font-bold tracking-wide">{(100 - progress).toFixed(0)}% Remaining</span>
            )}
           </div>

           {/* Progress bar matching image */}
           <div className="w-full h-1.5 bg-[#222] rounded-full overflow-hidden mt-auto">
             <div 
               className={`h-full transition-all duration-1000 ${progress > 80 ? 'bg-primary' : 'bg-[#555]'}`} 
               style={{ width: `${progress}%` }}
             ></div>
           </div>
        </div>
      </div>

      {/* OneChain Product Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: "OneDEX", icon: TrendingUp, status: "Monitoring swaps" },
          { name: "OnePlay", icon: Gamepad2, status: "Monitoring bets" },
          { name: "OnePoker", icon: Zap, status: "Monitoring stakes" }
        ].map((prod, i) => (
          <div key={i} className="metric-card p-4 flex items-center space-x-4 border-[#1f1f1f] bg-[#111] h-[80px]">
            <div className="w-[38px] h-[38px] rounded-lg bg-[#1a1a1a] border border-[#2a2a2c] flex items-center justify-center shrink-0">
              <prod.icon className="w-[18px] h-[18px] text-white/70" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white tracking-wide">{prod.name}</p>
              <p className="text-[11px] text-primary font-semibold mt-0.5">{prod.status}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Policies & Activity Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
        <div className="metric-card p-6 border-[#1f1f1f] bg-[#111]">
          <h3 className="text-[11px] font-bold tracking-widest uppercase mb-5 text-white/80">Active AI Policies</h3>
          <div className="space-y-3">
            {rules.length === 0 && (
              <p className="text-[12px] text-textMuted font-medium">No active policies found.</p>
            )}
            {rules.map((rule: any) => (
              <div key={rule.id} className="p-4 bg-[#161618] rounded-lg border border-[#262626] flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[13px] text-white/90 leading-relaxed pr-6">{rule.description}</p>
                  <div className="flex gap-2 mt-4">
                    <span className="text-[9px] px-2 py-0.5 rounded border border-[#333] uppercase tracking-widest font-bold text-textMuted">{rule.category}</span>
                    {rule.limit > 0 && (
                      <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 border border-primary/20 font-bold tracking-widest text-[#5588ff]">{rule.limit} OCT/daily</span>
                    )}
                  </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 border ${rule.active ? 'bg-[#5588ff] border-[#5588ff]' : 'bg-transparent border-[#333]'}`}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-card p-6 border-[#1f1f1f] bg-[#111]">
          <h3 className="text-[11px] font-bold tracking-widest uppercase mb-5 text-white/80 flex justify-between items-center">
            <span>Recent Activity</span>
            <Activity className="w-[14px] h-[14px] text-[#5588ff]" />
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {transactions.length === 0 && (
              <p className="text-[12px] text-textMuted font-medium">No recent transactions.</p>
            )}
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex justify-between items-center p-3 border-l-2 border-[#262626] bg-[#161618] rounded-r-lg">
                <div>
                  <p className="font-bold text-[13px] text-white/90">{tx.game}</p>
                  <p className="text-[#666] font-mono text-[9px] mt-1">{new Date(tx.timestamp).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold tracking-wide text-[12px] flex items-center justify-end ${tx.status === 'allowed' ? 'text-white/80' : 'text-primary'}`}>
                    {tx.status === 'allowed' ? <ArrowDownRight className="w-3 h-3 mr-1 text-[#666]"/> : <ShieldAlert className="w-3 h-3 mr-1"/>}
                    {tx.amount} OCT
                  </p>
                  <p className={`uppercase font-bold tracking-widest text-[9px] mt-1 ${tx.status === 'allowed' ? 'text-[#666]' : 'text-primary'}`}>{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
