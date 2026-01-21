
import React from 'react';
import { LayoutDashboard, Users, Receipt, PieChart, UserPlus, Plus, Cloud, CloudOff } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  groupName?: string;
  onAddClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, groupName, onAddClick }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row text-slate-900">
      {/* Sidebar for Desktop */}
      <nav className="hidden md:flex md:w-64 flex-col bg-white border-r border-slate-200 p-6 space-y-6">
        <div className="flex items-center space-x-2 text-indigo-600 mb-8">
          <Receipt className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">SplitSmart</span>
        </div>
        
        <div className="flex flex-col space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Groups" 
            active={activeTab === 'groups'} 
            onClick={() => onTabChange('groups')} 
          />
          {groupName && (
            <>
              <div className="pt-4 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {groupName}
              </div>
              <NavItem 
                icon={<PieChart size={20} />} 
                label="Dashboard" 
                active={activeTab === 'dashboard'} 
                onClick={() => onTabChange('dashboard')} 
              />
              <NavItem 
                icon={<Receipt size={20} />} 
                label="Expenses" 
                active={activeTab === 'expenses'} 
                onClick={() => onTabChange('expenses')} 
              />
              <NavItem 
                icon={<Users size={20} />} 
                label="Members" 
                active={activeTab === 'members'} 
                onClick={() => onTabChange('members')} 
              />
              <NavItem 
                icon={<UserPlus size={20} />} 
                label="Balances" 
                active={activeTab === 'balances'} 
                onClick={() => onTabChange('balances')} 
              />
            </>
          )}
        </div>

        <div className="mt-auto">
           <button 
            onClick={onAddClick}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20} />
            <span>Add Friend</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative pb-20 md:pb-0 h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0">
          <div className="md:hidden flex items-center space-x-2 text-indigo-600">
            <Receipt className="w-6 h-6" />
            <span className="text-lg font-bold">SplitSmart</span>
          </div>
          <div className="flex items-center space-x-3">
            <h1 className="hidden md:block text-xl font-semibold text-slate-800">
              {groupName ? groupName : 'SplitSmart Home'}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
             <button onClick={onAddClick} className="md:hidden p-2 text-indigo-600 bg-indigo-50 rounded-lg">
                <Plus size={20} />
             </button>
             <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold text-sm shadow-sm">
                JD
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>

        {/* Bottom Nav for Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
           <MobileNavItem 
            icon={<LayoutDashboard size={22} />} 
            label="Home" 
            active={activeTab === 'groups'} 
            onClick={() => onTabChange('groups')} 
          />
          {groupName && (
            <>
              <MobileNavItem 
                icon={<PieChart size={22} />} 
                active={activeTab === 'dashboard'} 
                onClick={() => onTabChange('dashboard')} 
              />
              <MobileNavItem 
                icon={<Receipt size={22} />} 
                active={activeTab === 'expenses'} 
                onClick={() => onTabChange('expenses')} 
              />
              <MobileNavItem 
                icon={<Users size={22} />} 
                active={activeTab === 'members'} 
                onClick={() => onTabChange('members')} 
              />
              <MobileNavItem 
                icon={<UserPlus size={22} />} 
                active={activeTab === 'balances'} 
                onClick={() => onTabChange('balances')} 
              />
            </>
          )}
        </nav>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const MobileNavItem = ({ icon, active, onClick, label }: { icon: React.ReactNode, active: boolean, onClick: () => void, label?: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center space-y-1 transition-all ${
      active ? 'text-indigo-600' : 'text-slate-400'
    }`}
  >
    {icon}
    {label && <span className="text-[10px]">{label}</span>}
  </button>
);

export default Layout;
