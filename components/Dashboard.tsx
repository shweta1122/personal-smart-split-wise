
import React, { useMemo } from 'react';
import { Group, Member } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface DashboardProps {
  group: Group;
  currentUserId: string;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC<DashboardProps> = ({ group, currentUserId }) => {
  const stats = useMemo(() => {
    const totalSpent = group.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate category breakdown
    const categoryMap: Record<string, number> = {};
    group.expenses.forEach(exp => {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
    });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // User's specific stats
    let youPaid = 0;
    let yourShare = 0;
    group.expenses.forEach(exp => {
      if (exp.paidBy === currentUserId) youPaid += exp.amount;
      const mySplit = exp.splits.find(s => s.memberId === currentUserId);
      if (mySplit) yourShare += mySplit.amount;
    });

    const netBalance = youPaid - yourShare;

    // Monthly spending trend
    const monthlyMap: Record<string, number> = {};
    group.expenses.forEach(exp => {
      const month = new Date(exp.date).toLocaleString('default', { month: 'short' });
      monthlyMap[month] = (monthlyMap[month] || 0) + exp.amount;
    });
    const monthlyData = Object.entries(monthlyMap).map(([name, amount]) => ({ name, amount }));

    return { totalSpent, youPaid, yourShare, netBalance, categoryData, monthlyData };
  }, [group, currentUserId]);

  return (
    <div className="space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Group Spending" 
          value={`$${stats.totalSpent.toFixed(2)}`} 
          icon={<TrendingUp className="text-indigo-600" />} 
          color="bg-indigo-50" 
        />
        <StatCard 
          label="Your Total Paid" 
          value={`$${stats.youPaid.toFixed(2)}`} 
          icon={<ArrowUpRight className="text-emerald-600" />} 
          color="bg-emerald-50" 
        />
        <StatCard 
          label="Your Total Share" 
          value={`$${stats.yourShare.toFixed(2)}`} 
          icon={<ArrowDownLeft className="text-orange-600" />} 
          color="bg-orange-50" 
        />
        <StatCard 
          label="Net Balance" 
          value={`${stats.netBalance >= 0 ? '+' : ''}$${stats.netBalance.toFixed(2)}`} 
          icon={<Wallet className={stats.netBalance >= 0 ? 'text-blue-600' : 'text-rose-600'} />} 
          color={stats.netBalance >= 0 ? 'bg-blue-50' : 'bg-rose-50'} 
          subtitle={stats.netBalance >= 0 ? "You are owed" : "You owe"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Group Spending Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Spending by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {stats.categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center space-x-2 text-xs font-medium text-slate-600">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, subtitle }: { label: string, value: string, icon: React.ReactNode, color: string, subtitle?: string }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
    <div className="flex justify-between items-start">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  </div>
);

export default Dashboard;
