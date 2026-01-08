
import React from 'react';
import { UserSettings } from '../types';

interface SidebarProps {
  activeTab: 'direct' | 'dashboard' | 'settings' | 'logs' | 'analytics';
  setActiveTab: (tab: 'direct' | 'dashboard' | 'settings' | 'logs' | 'analytics') => void;
  userSettings: UserSettings;
  onProfileClick: () => void;
  onApiKeyClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userSettings, onProfileClick, onApiKeyClick }) => {
  const menuItems = [
    { id: 'direct', label: '실시간 응대', icon: '🎧', primary: true },
    { id: 'dashboard', label: '대시보드', icon: '📊', primary: false },
    { id: 'logs', label: '문의 기록', icon: '📝', primary: false },
    { id: 'analytics', label: '통계 분석', icon: '📈', primary: false },
    { id: 'settings', label: '시설 설정', icon: '⚙️', primary: false },
  ] as const;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold shadow-lg shadow-indigo-500/20">S</div>
          <span className="text-xl font-bold tracking-tight">StayAI</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 mt-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 translate-x-1' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            } ${item.primary ? 'mb-4 border-b border-slate-800 pb-5 rounded-none' : ''}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className={`font-medium ${item.primary ? 'font-bold text-slate-100' : ''}`}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 space-y-2 mt-auto">
        <button 
          onClick={onApiKeyClick}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-white rounded-2xl border border-slate-700/50 transition-all text-xs font-bold"
        >
          <span>🔑</span>
          <span>API 키 관리</span>
        </button>
        
        <button 
          onClick={onProfileClick}
          className="w-full text-left p-4 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border border-transparent hover:border-slate-600 group"
        >
          <div className="flex justify-between items-center mb-1">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider group-hover:text-indigo-400 transition-colors">담당자 정보</p>
            <span className="text-[10px] text-slate-500 group-hover:text-slate-300">수정</span>
          </div>
          <p className="text-sm font-bold truncate">{userSettings.managerName} 님</p>
          <p className="text-[10px] text-slate-500 truncate">{userSettings.facilityName}</p>
        </button>
      </div>
    </aside>
  );
};
