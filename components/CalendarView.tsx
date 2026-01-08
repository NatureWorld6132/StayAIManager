
import React, { useState, useEffect } from 'react';
import { UserSettings, CalendarEvent } from '../types';
import { fetchMockSyncedEvents } from '../services/gemini';

interface CalendarViewProps {
  userSettings: UserSettings;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ userSettings }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [lastSynced, setLastSynced] = useState<string>('');

  const syncData = async () => {
    setIsSyncing(true);
    try {
      const syncedData = await fetchMockSyncedEvents(userSettings.facilityName);
      setEvents(syncedData);
      setLastSynced(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (error) {
      console.error("Sync failed", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogin = async () => {
    setIsSyncing(true);
    // 1초간 로그인 처리 시뮬레이션 후 데이터 동기화
    setTimeout(async () => {
      setIsLoggedIn(true);
      await syncData();
    }, 1200);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEvents([]);
  };

  const openGoogleCalendar = () => {
    window.open('https://calendar.google.com', '_blank', 'noopener,noreferrer');
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center border border-slate-100 relative">
          {isSyncing && (
             <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          )}
          <svg className="w-12 h-12" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.13-.45-4.63H24v9.3h12.98c-.58 2.85-2.18 5.25-4.59 6.81l7.41 5.76c4.35-4.01 6.81-9.92 6.81-17.24z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.41-5.76c-2.11 1.41-4.8 2.25-8.48 2.25-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
        </div>
        
        <div className="max-w-xs space-y-2">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">구글 캘린더 연동하기</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            구글 계정에 로그인하여 {userSettings.facilityName}의 실시간 예약 일정을 관리하세요.
          </p>
        </div>

        <button 
          onClick={handleLogin}
          disabled={isSyncing}
          className={`flex items-center space-x-3 px-8 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 group ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSyncing ? (
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71a5.41 5.41 0 0 1 0-3.42V4.958H.957a8.993 8.993 0 0 0 0 8.083l3.007-2.331z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
          )}
          <span className="text-sm font-bold text-slate-700">{isSyncing ? '데이터 동기화 중...' : 'Google 계정으로 로그인'}</span>
        </button>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Powered by Google Cloud Platform</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-100">
            {isSyncing ? <span className="animate-spin text-lg">🔄</span> : '📅'}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800">실시간 동기화 일정</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={syncData}
            disabled={isSyncing}
            className={`p-2 text-slate-400 hover:text-indigo-600 transition-colors ${isSyncing ? 'opacity-50' : ''}`}
            title="새로고침"
          >
            <span className={`text-lg inline-block ${isSyncing ? 'animate-spin' : ''}`}>🔄</span>
          </button>
          <button 
            onClick={handleLogout}
            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative">
        {isSyncing && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
             <div className="flex flex-col items-center space-y-3">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-indigo-600">구글 서버와 연결 중...</p>
             </div>
          </div>
        )}

        {events.length > 0 ? (
          events.map(event => (
            <div 
              key={event.id} 
              className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between hover:border-indigo-100 transition-all hover:shadow-sm group cursor-default"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-2 h-10 rounded-full transition-all group-hover:scale-y-110 ${
                  event.color === 'indigo' ? 'bg-indigo-500' : 
                  event.color === 'amber' ? 'bg-amber-500' : 
                  event.color === 'emerald' ? 'bg-emerald-500' : 
                  event.color === 'rose' ? 'bg-rose-500' : 'bg-slate-300'
                }`}></div>
                <div>
                  <p className="text-sm font-black text-slate-800 mb-0.5">{event.title}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{event.time}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                      event.type === '입실' ? 'bg-indigo-50 text-indigo-600' : 
                      event.type === '퇴실' ? 'bg-amber-50 text-amber-600' : 
                      event.type === '점검' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                    }`}>{event.type}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={openGoogleCalendar}
                className="text-slate-300 hover:text-indigo-600 transition-all transform hover:translate-x-1"
                title="구글 캘린더에서 보기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          ))
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="text-4xl">📡</div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-600">불러올 일정이 없습니다.</p>
              <p className="text-xs text-slate-400">구글 캘린더와 연동을 완료해 주세요.</p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[10px] text-slate-400 font-bold">
          {lastSynced ? `마지막 동기화: ${lastSynced}` : '동기화 대기 중'}
        </p>
        <button 
          onClick={openGoogleCalendar}
          className="text-xs font-black text-indigo-600 hover:text-indigo-700 hover:underline flex items-center space-x-1 transition-all"
        >
          <span>캘린더 앱 열기</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f5f9;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};
