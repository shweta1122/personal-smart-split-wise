
import React, { useMemo } from 'react';
import { Group, Member, Debt } from '../types';
import { ArrowRight, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

interface BalanceListProps {
  group: Group;
  currentUserId: string;
}

const BalanceList: React.FC<BalanceListProps> = ({ group, currentUserId }) => {
  const calculations = useMemo(() => {
    // 1. Calculate net balance for each user
    const netBalances: Record<string, number> = {};
    group.members.forEach(m => (netBalances[m.id] = 0));

    group.expenses.forEach(exp => {
      // Add total amount to the payer's balance
      netBalances[exp.paidBy] += exp.amount;
      // Subtract each member's share
      exp.splits.forEach(split => {
        netBalances[split.memberId] -= split.amount;
      });
    });

    // 2. Separate into debtors (negative balance) and creditors (positive balance)
    const debtors: { id: string, amount: number }[] = [];
    const creditors: { id: string, amount: number }[] = [];

    Object.entries(netBalances).forEach(([id, amount]) => {
      if (amount < -0.01) debtors.push({ id, amount: Math.abs(amount) });
      else if (amount > 0.01) creditors.push({ id, amount });
    });

    // 3. Greedy algorithm to simplify debts
    const debts: Debt[] = [];
    let dIdx = 0, cIdx = 0;
    const tempDebtors = [...debtors].sort((a, b) => b.amount - a.amount);
    const tempCreditors = [...creditors].sort((a, b) => b.amount - a.amount);

    while (dIdx < tempDebtors.length && cIdx < tempCreditors.length) {
      const debtor = tempDebtors[dIdx];
      const creditor = tempCreditors[cIdx];
      const settled = Math.min(debtor.amount, creditor.amount);

      debts.push({ from: debtor.id, to: creditor.id, amount: settled });

      debtor.amount -= settled;
      creditor.amount -= settled;

      if (debtor.amount <= 0.01) dIdx++;
      if (creditor.amount <= 0.01) cIdx++;
    }

    return { netBalances, simplifiedDebts: debts };
  }, [group]);

  const getUserName = (id: string) => group.members.find(m => m.id === id)?.name || 'Unknown';

  const userNet = calculations.netBalances[currentUserId] || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Personal Summary */}
      <div className={`p-6 rounded-3xl border ${userNet >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-rose-50 border-rose-100'} flex items-center justify-between`}>
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${userNet >= 0 ? 'bg-indigo-100' : 'bg-rose-100'}`}>
            {userNet >= 0 ? <CheckCircle2 className="text-indigo-600" /> : <AlertCircle className="text-rose-600" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {userNet >= 0 ? "You are all settled up!" : "You owe money in this group"}
            </h3>
            <p className="text-slate-500 text-sm">
              {userNet >= 0 
                ? "Total amount others owe you" 
                : "Total amount you need to pay back"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-black ${userNet >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
            ${Math.abs(userNet).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Net Balances List */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
             <TrendingUp size={16} />
             <span>Group Balances</span>
          </h3>
          <div className="space-y-3">
            {group.members.map(m => {
              const bal = calculations.netBalances[m.id];
              return (
                <div key={m.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                   <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center font-bold text-xs">
                        {m.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-700">{m.id === currentUserId ? 'You' : m.name}</span>
                   </div>
                   <div className={`text-sm font-bold ${bal > 0 ? 'text-emerald-500' : bal < 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                      {bal > 0 ? '+' : ''}${bal.toFixed(2)}
                   </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Simplified Debts */}
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Suggested Settlements</h3>
          <div className="space-y-4">
            {calculations.simplifiedDebts.length === 0 ? (
              <div className="text-slate-400 text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                Everyone is settled up!
              </div>
            ) : (
              calculations.simplifiedDebts.map((debt, idx) => (
                <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex flex-col items-center">
                      <span className="text-slate-500 text-xs mb-1">From</span>
                      <span className="font-bold text-slate-900">{debt.from === currentUserId ? 'You' : getUserName(debt.from)}</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 px-4">
                      <div className="h-[1px] w-full bg-slate-100 relative mb-1">
                        <ArrowRight className="absolute -right-2 -top-2 text-indigo-400" size={16} />
                      </div>
                      <span className="text-indigo-600 font-black text-lg">${debt.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-slate-500 text-xs mb-1">To</span>
                      <span className="font-bold text-slate-900">{debt.to === currentUserId ? 'You' : getUserName(debt.to)}</span>
                    </div>
                  </div>
                  {debt.from === currentUserId && (
                    <button className="w-full py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                      Settle Debt
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceList;
