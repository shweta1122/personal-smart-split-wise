
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import GroupList from './components/GroupList';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import BalanceList from './components/BalanceList';
import MemberManager from './components/MemberManager';
import GlobalAddModal from './components/GlobalAddModal';
import CloudSettings from './components/CloudSettings';
import ConfirmationModal from './components/ConfirmationModal';
import { Group, AppState, Expense, Member } from './types';
import { 
  subscribeToGroups, 
  subscribeToFriends, 
  saveGroup, 
  saveFriend, 
  updateGroupExpenses,
  addMemberToGroup,
  deleteGroupDoc,
  updateGroupMembers,
  initFirebase 
} from './services/firebase';
import { CloudOff, Cloud, RefreshCcw } from 'lucide-react';

const CURRENT_USER: Member = {
  id: 'u1',
  name: 'John Doe',
  email: 'john@example.com'
};

const App: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>(() => {
    const saved = localStorage.getItem('splitsmart_groups');
    return saved ? JSON.parse(saved) : [];
  });
  const [friends, setFriends] = useState<Member[]>(() => {
    const saved = localStorage.getItem('splitsmart_friends');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('groups');
  const [showGlobalAdd, setShowGlobalAdd] = useState(false);
  const [showCloudSettings, setShowCloudSettings] = useState(false);
  
  // Deletion Modal State
  const [pendingDelete, setPendingDelete] = useState<{ type: 'group' | 'expense' | 'member', id: string } | null>(null);

  const [syncStatus, setSyncStatus] = useState<'offline' | 'connecting' | 'synced' | 'error'>('offline');
  const [firebaseConfig, setFirebaseConfig] = useState<any>(() => {
    const saved = localStorage.getItem('firebase_config');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('splitsmart_groups', JSON.stringify(groups));
    localStorage.setItem('splitsmart_friends', JSON.stringify(friends));
  }, [groups, friends]);

  useEffect(() => {
    if (!firebaseConfig) {
      setSyncStatus('offline');
      return;
    }

    setSyncStatus('connecting');
    const initialized = initFirebase(firebaseConfig);
    
    if (initialized) {
      const unsubGroups = subscribeToGroups(
        (data) => {
          if (data.length > 0) setGroups(data);
          setSyncStatus('synced');
        },
        (err) => setSyncStatus('error')
      );
      const unsubFriends = subscribeToFriends((data) => {
        if (data.length > 0) setFriends(data);
      });

      return () => {
        unsubGroups();
        unsubFriends();
      };
    } else {
      setSyncStatus('error');
    }
  }, [firebaseConfig]);

  const handleCreateGroup = async (name: string, type: 'apartment' | 'trip' | 'other') => {
    const newGroup: Group = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description: '',
      type,
      members: [CURRENT_USER], 
      expenses: [],
    };
    
    setGroups(prev => [...prev, newGroup]);
    if (syncStatus === 'synced') {
      await saveGroup(newGroup);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    const { type, id } = pendingDelete;

    if (type === 'group') {
      setGroups(prev => prev.filter(g => g.id !== id));
      if (activeGroupId === id) {
        setActiveGroupId(null);
        setActiveTab('groups');
      }
      if (syncStatus === 'synced') await deleteGroupDoc(id);
    } 
    else if (type === 'expense' && activeGroupId) {
      const group = groups.find(g => g.id === activeGroupId);
      if (group) {
        const updatedExpenses = group.expenses.filter(e => e.id !== id);
        setGroups(prev => prev.map(g => g.id === activeGroupId ? { ...g, expenses: updatedExpenses } : g));
        if (syncStatus === 'synced') await updateGroupExpenses(activeGroupId, updatedExpenses);
      }
    }
    else if (type === 'member' && activeGroupId) {
      const group = groups.find(g => g.id === activeGroupId);
      if (group) {
        const updatedMembers = group.members.filter(m => m.id !== id);
        setGroups(prev => prev.map(g => g.id === activeGroupId ? { ...g, members: updatedMembers } : g));
        if (syncStatus === 'synced') await updateGroupMembers(activeGroupId, updatedMembers);
      }
    }

    setPendingDelete(null);
  };

  const handleSelectGroup = (id: string | null) => {
    setActiveGroupId(id);
    setActiveTab(id ? 'dashboard' : 'groups');
  };

  const handleAddPerson = async (name: string, email: string, groupId?: string) => {
    const newMember: Member = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email: email || undefined,
    };

    setFriends(prev => [...prev, newMember]);
    if (groupId) {
      setGroups(prev => prev.map(g => g.id === groupId ? { ...g, members: [...g.members, newMember] } : g));
    }

    if (syncStatus === 'synced') {
      await saveFriend(newMember);
      if (groupId) await addMemberToGroup(groupId, newMember);
    }
  };

  const handleAddExpense = async (expenseData: Omit<Expense, 'id'>) => {
    if (!activeGroupId) return;

    const newExpense: Expense = {
      ...expenseData,
      id: Math.random().toString(36).substr(2, 9),
    };

    const group = groups.find(g => g.id === activeGroupId);
    if (!group) return;

    const updatedExpenses = [...group.expenses, newExpense];
    setGroups(prev => prev.map(g => g.id === activeGroupId ? { ...g, expenses: updatedExpenses } : g));
    
    if (syncStatus === 'synced') {
      await updateGroupExpenses(activeGroupId, updatedExpenses);
    }
  };

  const handleSaveConfig = (config: any) => {
    localStorage.setItem('firebase_config', JSON.stringify(config));
    setFirebaseConfig(config);
    window.location.reload();
  };

  const activeGroup = groups.find(g => g.id === activeGroupId);

  const renderTab = () => {
    if (activeTab === 'groups' || !activeGroup) {
      return (
        <GroupList 
          groups={groups} 
          friends={friends}
          onSelectGroup={handleSelectGroup} 
          onCreateGroup={handleCreateGroup} 
          onDeleteGroup={(id) => setPendingDelete({ type: 'group', id })}
          onOpenGlobalAdd={() => setShowGlobalAdd(true)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard group={activeGroup} currentUserId={CURRENT_USER.id} />;
      case 'expenses':
        return (
          <ExpenseList 
            group={activeGroup} 
            currentUserId={CURRENT_USER.id} 
            onAddExpense={handleAddExpense}
            onDeleteExpense={(id) => setPendingDelete({ type: 'expense', id })}
          />
        );
      case 'members':
        return (
          <MemberManager 
            group={activeGroup} 
            currentUserId={CURRENT_USER.id} 
            onAddMember={(name, email) => handleAddPerson(name, email, activeGroup.id)} 
            onRemoveMember={(id) => setPendingDelete({ type: 'member', id })}
          />
        );
      case 'balances':
        return <BalanceList group={activeGroup} currentUserId={CURRENT_USER.id} />;
      default:
        return null;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      groupName={activeGroup?.name}
      onAddClick={() => setShowGlobalAdd(true)}
    >
      <div className="relative">
        <button 
          onClick={() => setShowCloudSettings(true)}
          className={`fixed top-4 right-4 z-[110] flex items-center space-x-2 backdrop-blur px-3 py-1.5 rounded-full border shadow-sm transition-all hover:scale-105 active:scale-95 ${
            syncStatus === 'synced' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-600' :
            syncStatus === 'error' ? 'bg-rose-50/80 border-rose-200 text-rose-600' :
            syncStatus === 'connecting' ? 'bg-blue-50/80 border-blue-200 text-blue-600' :
            'bg-white/80 border-slate-200 text-slate-500'
          }`}
        >
          {syncStatus === 'synced' && <Cloud size={14} />}
          {syncStatus === 'error' && <CloudOff size={14} />}
          {syncStatus === 'connecting' && <RefreshCcw size={14} className="animate-spin" />}
          {syncStatus === 'offline' && <CloudOff size={14} />}
          
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {syncStatus === 'synced' ? 'Cloud Synced' : 
             syncStatus === 'error' ? 'Auth Error' :
             syncStatus === 'connecting' ? 'Syncing...' : 'Local Only'}
          </span>
        </button>

        {renderTab()}
      </div>

      {showGlobalAdd && (
        <GlobalAddModal 
          groups={groups}
          onClose={() => setShowGlobalAdd(false)}
          onAdd={handleAddPerson}
        />
      )}

      {showCloudSettings && (
        <CloudSettings 
          currentConfig={firebaseConfig}
          onClose={() => setShowCloudSettings(false)}
          onSave={handleSaveConfig}
        />
      )}

      <ConfirmationModal 
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
        title={
          pendingDelete?.type === 'group' ? "Delete Group?" : 
          pendingDelete?.type === 'expense' ? "Delete Expense?" : 
          "Remove Member?"
        }
        message={
          pendingDelete?.type === 'group' ? "This will permanently delete this group and all associated expenses. This action cannot be undone." : 
          pendingDelete?.type === 'expense' ? "Are you sure you want to remove this expense from the group history?" : 
          "Are you sure you want to remove this person from the group? Their previous expenses will remain, but they won't be part of future splits."
        }
      />
    </Layout>
  );
};

export default App;
