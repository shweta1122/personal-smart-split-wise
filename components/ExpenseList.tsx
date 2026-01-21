
import React, { useState, useRef } from 'react';
import { Group, Expense, Member, Split } from '../types';
import { Plus, Camera, Search, Filter, Calendar, Tag, User, Trash2, Loader2, Sparkles } from 'lucide-react';
import { suggestCategory, parseReceiptImage } from '../services/geminiService';

interface ExpenseListProps {
  group: Group;
  currentUserId: string;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ group, currentUserId, onAddExpense, onDeleteExpense }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(currentUserId);
  const [category, setCategory] = useState('Other');
  const [splits, setSplits] = useState<Split[]>(group.members.map(m => ({ memberId: m.id, amount: 0 })));

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    
    const numAmount = parseFloat(amount);
    const equalSplit = numAmount / group.members.length;
    const finalSplits = group.members.map(m => ({ memberId: m.id, amount: equalSplit }));

    const finalCategory = category === 'Other' ? await suggestCategory(desc) : category;

    onAddExpense({
      description: desc,
      amount: numAmount,
      date: new Date().toISOString(),
      paidBy: paidBy,
      category: finalCategory,
      splits: finalSplits
    });

    resetForm();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const data = await parseReceiptImage(base64);
        setDesc(data.merchant || '');
        setAmount(data.amount.toString() || '');
        setCategory(data.category || 'Other');
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsScanning(false);
    }
  };

  const resetForm = () => {
    setDesc('');
    setAmount('');
    setCategory('Other');
    setShowAdd(false);
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      'Rent': 'bg-blue-100 text-blue-700',
      'Groceries': 'bg-emerald-100 text-emerald-700',
      'Dining': 'bg-orange-100 text-orange-700',
      'Utilities': 'bg-purple-100 text-purple-700',
      'Travel': 'bg-cyan-100 text-cyan-700'
    };
    return colors[cat] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search expenses..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="flex space-x-2">
          <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
            <Filter size={18} />
          </button>
          <button 
            onClick={() => setShowAdd(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all font-medium shadow-sm"
          >
            <Plus size={18} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">Expense</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Paid By</th>
              <th className="px-6 py-4 hidden sm:table-cell">Category</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {group.expenses.slice().reverse().map(exp => (
              <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{exp.description}</span>
                    <span className="text-xs text-slate-400">{new Date(exp.date).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-900">${exp.amount.toFixed(2)}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[10px] font-bold uppercase">
                      {group.members.find(m => m.id === exp.paidBy)?.name.charAt(0)}
                    </div>
                    <span className="text-sm text-slate-600">
                      {exp.paidBy === currentUserId ? 'You' : group.members.find(m => m.id === exp.paidBy)?.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getCategoryColor(exp.category)}`}>
                    {exp.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onDeleteExpense(exp.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {group.expenses.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            No expenses found. Click "Add Expense" to get started.
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Add New Expense</h3>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="flex items-center space-x-2 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all"
              >
                {isScanning ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Sparkles size={20} />
                )}
                <span className="text-sm font-semibold">{isScanning ? 'Scanning...' : 'AI Scan Receipt'}</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Description</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="e.g. Weekly Groceries"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Paid By</label>
                  <select 
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                  >
                    {group.members.map(m => (
                      <option key={m.id} value={m.id}>{m.id === currentUserId ? 'You' : m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                  >
                    {['Other', 'Rent', 'Groceries', 'Dining', 'Utilities', 'Travel', 'Entertainment'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl">
                 <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Split Method: Equally</h4>
                 <div className="space-y-2">
                    {group.members.map(m => (
                      <div key={m.id} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">{m.name}</span>
                        <span className="font-semibold text-slate-900">
                          ${amount ? (parseFloat(amount) / group.members.length).toFixed(2) : '0.00'}
                        </span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
