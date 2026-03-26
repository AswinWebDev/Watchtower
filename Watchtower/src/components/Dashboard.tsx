import { useStore } from '../store';
import { ShieldCheck, ShieldAlert, Activity, ArrowDownRight } from 'lucide-react';

export const Dashboard = () => {
  const { totalBalance, usedDaily, rules, transactions } = useStore();
  
  const dailyRule = rules.find((r: any) => r.category === 'GameFi' && r.period === 'daily' && r.active);
  const dailyLimit = dailyRule ? dailyRule.limit : 0;
  const progress = dailyLimit > 0 ? Math.min((usedDaily / dailyLimit) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <h3 className="text-textMuted text-sm font-medium">Total Shielded Balance</h3>
          <p className="text-4xl font-bold mt-2 z-10">{totalBalance.toFixed(2)} <span className="text-xl text-primary font-normal">USDO</span></p>
          <div className="mt-4 flex items-center text-sm text-green-400 font-medium z-10">
            <ShieldCheck className="w-4 h-4 mr-1" />
            Protected by Move Vault
          </div>
        </div>

        <div className="glass-panel p-6 col-span-2 relative overflow-hidden">
           <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/10 rounded-full blur-3xl -mr-10 -mb-10"></div>
          <h3 className="text-textMuted text-sm font-medium mb-4">Daily GameFi Budget Usage</h3>
          <div className="flex justify-between items-end mb-2 z-10 relative">
            <div>
              <p className="text-3xl font-bold">{usedDaily.toFixed(2)} <span className="text-lg text-textMuted font-normal">/ {dailyLimit} USDO</span></p>
            </div>
            <div className="text-right">
              {progress >= 100 ? (
                <span className="text-red-400 flex items-center font-medium"><ShieldAlert className="w-4 h-4 mr-1"/> Limits Reached</span>
              ) : (
                <span className="text-accent font-medium">{100 - progress}% Remaining</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">Active AI Policies</h3>
          <div className="space-y-3">
            {rules.map((rule: any) => (
              <div key={rule.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-start justify-between hover:bg-white/10 transition-colors cursor-default">
                <div>
                  <p className="font-medium text-sm text-white/90 leading-snug">{rule.description}</p>
                  <p className="text-xs text-textMuted mt-2 w-fit px-2 py-0.5 rounded-md bg-white/5 border border-white/10 uppercase tracking-wider font-semibold">{rule.category}</p>
                </div>
                <div className={`w-3 h-3 rounded-full shrink-0 ml-4 ${rule.active ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-gray-500'}`}></div>
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
            {transactions.map((tx: any) => (
              <div key={tx.id} className="flex flex-col p-3 border-l-2 border-white/10 bg-white/5 rounded-r-lg hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-sm text-white/90">{tx.game}</span>
                  <span className={`font-bold flex items-center ${tx.status === 'allowed' ? 'text-white' : 'text-red-400'}`}>
                    {tx.status === 'allowed' ? <ArrowDownRight className="w-3 h-3 mr-1 text-primary"/> : <ShieldAlert className="w-3 h-3 mr-1"/>}
                    {tx.amount} USDO
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-textMuted">{tx.timestamp.toLocaleTimeString()}</span>
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
