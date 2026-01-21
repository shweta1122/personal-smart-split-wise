
import React, { useState } from 'react';
import { Group, Member } from '../types';
import { Plus, Home, Plane, MoreHorizontal, ArrowRight, Users, UserPlus, Trash2 } from 'lucide-react';

interface GroupListProps {
  groups: Group[];
  friends: Member[];
  onSelectGroup: (id: string | null) => void;
  onCreateGroup: (name: string, type: 'apartment' | 'trip' | 'other') => void;
  onDeleteGroup: (id: string) => void;
  onOpenGlobalAdd: () => void;
}

const GroupList: React.FC<GroupListProps> = ({ groups, friends, onSelectGroup, onCreateGroup, onDeleteGroup, onOpenGlobalAdd }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState<'apartment' | 'trip' | 'other'>('apartment');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    onCreateGroup(newGroupName, newGroupType);
    setNewGroupName('');
    setShowCreate(false);
  };

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'apartment': return <Home className="text-blue-500" />;
      case 'trip': return <Plane className="text-orange-500" />;
      default: return <MoreHorizontal className="text-slate-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      {/* Left Column: Groups */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Groups</h2>
          <button 
            onClick={() => setShowCreate(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all font-bold shadow-sm"
          >
            <Plus size={18} />
            <span className="text-sm">New Group</span>
          </button>
        </div>

        {groups.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-[32px] p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">You don't have any groups yet.</h3>
            <p className="text-slate-400 mt-2 mb-6">Create one to start splitting house bills or trip expenses.</p>
            <button onClick={() => setShowCreate(true)} className="text-indigo-600 font-bold hover:underline">
              Add your first group
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {groups.map(group => (
            <div
              key={group.id}
              className="group flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-50/50 transition-all cursor-pointer"
              onClick={() => onSelectGroup(group.id)}
            >
              <div className="flex items-center space-x-5">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors border border-slate-100">
                  {getGroupIcon(group.type)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{group.name}</h3>
                  <p className="text-sm font-medium text-slate-400">{group.members.length} members • {group.expenses.length} expenses</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteGroup(group.id);
                  }}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  title="Delete Group"
                >
                  <Trash2 size={20} />
                </button>
                <ArrowRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" size={24} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Friends (Splitwise Sidebar Style) */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Friends</h2>
          <button 
            onClick={onOpenGlobalAdd}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <UserPlus size={20} />
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
          {friends.length === 0 ? (
            <div className="p-8 text-center">
               <p className="text-slate-400 text-sm">No friends added yet.</p>
               <button onClick={onOpenGlobalAdd} className="mt-4 text-indigo-600 text-sm font-bold hover:underline">
                  Add someone
               </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {friends.map(friend => (
                <div key={friend.id} className="p-4 flex items-center space-x-4 hover:bg-slate-50 transition-colors cursor-default group">
                  <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center font-bold text-xs uppercase group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                    {friend.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">{friend.name}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[120px]">{friend.email || 'No email'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Create New Group</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Group Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Dream House"
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50/50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Group Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['apartment', 'trip', 'other'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewGroupType(type)}
                      className={`px-3 py-3 rounded-xl text-xs font-bold border transition-all uppercase tracking-tighter ${
                        newGroupType === type 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!newGroupName.trim()}
                  className="flex-1 px-4 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-100"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupList;
