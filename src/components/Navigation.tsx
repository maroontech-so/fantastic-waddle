import React, { useState } from 'react';
import { LayoutDashboard, Library, MessageSquare, User as UserIcon, Settings, LogOut, Code2, Terminal, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { User } from '../types';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: User | null;
  onSignOut: () => void;
  onToast: (msg: string) => void;
}

export const Sidebar: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  user,
  onSignOut,
  onToast,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('mku_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('mku_sidebar_collapsed', String(nextState));
    onToast(nextState ? 'Sidebar collapsed' : 'Sidebar expanded');
  };

  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col h-full bg-white dark:bg-slate-900/95 backdrop-blur-2xl text-slate-800 dark:text-slate-100 z-40 shrink-0 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 relative"
      style={{ width: isCollapsed ? '76px' : '200px' }}
    >
      {/* Decorative gradient blur in background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Sidebar Header Brand Area */}
      <div className={`p-4 flex items-center ${isCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between'} border-b border-slate-200 dark:border-slate-800/60 sidebar-brand relative z-10 min-h-[72px] shrink-0`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <img src="/logo.svg" className="w-5 h-5 object-contain brightness-0 invert" alt="AdvocoDe logo" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in whitespace-nowrap">
              <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">&lt;/AdvocoDe&gt;</h1>
              </div>
          )}
        </div>
        
        <button
          onClick={toggleCollapse}
          className={`p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg transition-colors cursor-pointer ${
            isCollapsed ? 'mt-1' : 'ml-2'
          }`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4.5'} py-6 space-y-1.5 overflow-y-auto relative z-10 no-scrollbar`}>
        {!isCollapsed && (
          <p className="px-3.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 sidebar-text">
            workspace
          </p>
        )}
        
        <button
          onClick={() => onNavigate('chat')}
          title={isCollapsed ? "Hub" : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'} py-2.5 rounded-xl transition-all duration-200 apple-active cursor-pointer relative ${
            currentView === 'chat'
              ? 'bg-blue-50/70 dark:bg-white/10 text-blue-500 dark:text-white shadow-sm dark:shadow-md font-light'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative flex items-center justify-center shrink-0">
            <MessageSquare className="w-4.5 h-4.5" />
            {isCollapsed && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full shadow-sm"></span>
            )}
          </div>
          {!isCollapsed && (
            <>
              <span className="text-xs animate-fade-in whitespace-nowrap font-light">Hub</span>
              <span className="ml-auto bg-blue-500/90 text-white text-[9px] font-light px-1.5 py-0.5 rounded-full shadow-sm">
                Live
              </span>
            </>
          )}
        </button>

        <button
          onClick={() => onNavigate('library')}
          title={isCollapsed ? "Resources" : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'} py-2.5 rounded-xl transition-all duration-200 apple-active cursor-pointer ${
            currentView === 'library'
              ? 'bg-blue-50/70 dark:bg-white/10 text-blue-500 dark:text-white shadow-sm dark:shadow-md font-light'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Library className="w-4.5 h-4.5 shrink-0" />
          {!isCollapsed && <span className="text-xs animate-fade-in whitespace-nowrap font-light">Resources</span>}
        </button>

        <button
          onClick={() => onNavigate('tutorials')}
          title={isCollapsed ? "Tutorials" : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'} py-2.5 rounded-xl transition-all duration-200 apple-active cursor-pointer ${
            currentView === 'tutorials'
              ? 'bg-blue-50/70 dark:bg-white/10 text-blue-500 dark:text-white shadow-sm dark:shadow-md font-light border-l border-indigo-500'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
          {!isCollapsed && <span className="text-xs animate-fade-in whitespace-nowrap font-light">Tutorials</span>}
        </button>

        {/* INBUILT CODE EDITOR - PC PRIMARY FEATURE */}
        <button
          onClick={() => onNavigate('editor')}
          title={isCollapsed ? "Code Play" : undefined}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'} py-2.5 rounded-xl transition-all duration-200 apple-active cursor-pointer ${
            currentView === 'editor'
              ? 'bg-blue-50/70 dark:bg-white/10 text-blue-500 dark:text-white shadow-sm dark:shadow-md font-light border-l border-blue-500'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="text-xs animate-fade-in whitespace-nowrap font-light">Code Play</span>
              <span className="ml-auto bg-indigo-500/10 text-indigo-400 text-[8px] font-light px-1.5 py-0.5 rounded uppercase tracking-wider">
                PC
              </span>
            </>
          )}
        </button>


      </nav>

      {user && (
        <div className={`p-4 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20 flex shrink-0 ${isCollapsed ? 'justify-center' : ''}`}>
          <button
            onClick={() => onNavigate('profile')}
            title={isCollapsed ? `${user.name} - Profile Settings` : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-1' : 'gap-3 p-2'} rounded-xl transition-all text-left apple-active ${
              currentView === 'profile' ? 'bg-blue-50 dark:bg-white/10 text-blue-600 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
            }`}
          >
            <img
              src={
                user.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff`
              }
              alt="Profile"
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm shrink-0"
            />
            {!isCollapsed && (
              <>
                <div className="flex-1 overflow-hidden animate-fade-in">
                  <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white">{user.name}</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">{user.regNumber}</p>
                </div>
                <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 hover:text-slate-800 dark:hover:text-white transition-colors" />
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};

export const BottomNav: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
}) => {
  const tabs = [
    { id: 'chat', label: 'Hub', icon: MessageSquare, badge: true },
    { id: 'library', label: 'Resources', icon: Library },
    { id: 'tutorials', label: 'Tutorials', icon: GraduationCap },
    { id: 'editor', label: 'Code', icon: Terminal },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/75 backdrop-blur-lg border border-slate-200/50 rounded-2xl shadow-xl shadow-slate-200/50 z-40 h-16">
      <div className="flex h-full items-center justify-around px-1.5">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = currentView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-95 transition-all duration-150 cursor-pointer"
            >
              <div
                className={`relative px-3.5 py-1.5 rounded-xl transition-all duration-300 flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-600 text-white scale-105 shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <IconComponent className="w-4.5 h-4.5" />
                {tab.badge && (
                  <span className={`absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full border border-white ${isActive ? 'bg-white' : 'bg-blue-600'}`}></span>
                )}
              </div>
              <span
                className={`text-[9px] mt-0.5 transition-all duration-200 ${
                  isActive ? 'font-bold text-slate-800' : 'font-medium text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

interface AndroidDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  user: User | null;
  onSignOut: () => void;
  onToast: (msg: string) => void;
}

export const AndroidDrawer: React.FC<AndroidDrawerProps> = ({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  user,
  onSignOut,
  onToast,
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 md:hidden ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Semi-transparent Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-[275px] bg-white dark:bg-slate-900 rounded-r-2xl shadow-2xl z-10 flex flex-col h-full transform transition-transform duration-300 ease-out border-r border-slate-200 dark:border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* iOS / Apple aesthetic drawer header */}
        <div className="p-6 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 relative overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shrink-0">
              <img src="/logo.svg" className="w-5 h-5 object-contain brightness-0 invert" alt="AdvocoDe logo" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">&lt;/AdvocoDe&gt; Network</h2>
              <p className="text-[9px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Hub Companion</p>
            </div>
          </div>

          {user && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
              <img
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff`}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</h4>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{user.regNumber}</p>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Menu Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 bg-white dark:bg-slate-900/50">
          <p className="px-3.5 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Workspace</p>
          
          {[
            { id: 'chat', label: 'Hub', icon: MessageSquare },
            { id: 'library', label: 'Resources', icon: Library },
            { id: 'tutorials', label: 'Tutorials', icon: GraduationCap },
            { id: 'editor', label: 'Code Play', icon: Terminal },
            { id: 'profile', label: 'Profile Settings', icon: UserIcon },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all font-semibold text-xs apple-active ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 shadow-inner'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <button
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 cursor-pointer text-xs"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

