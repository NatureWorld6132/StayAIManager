
import React, { useState } from 'react';
import { UserSettings } from '../types';
import { UserSettingsForm } from './UserSettingsForm';

interface FacilitySettingsProps {
  userSettings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
}

export const FacilitySettings: React.FC<FacilitySettingsProps> = ({ userSettings, onUpdateSettings }) => {
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'rooms' | 'faq' | 'integration'>('info');

  return (
    <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
      <div className="border-b border-slate-100">
        <div className="flex px-8 overflow-x-auto scrollbar-hide">
          {(['info', 'rooms', 'faq', 'integration'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-6 py-5 text-sm font-black transition-all border-b-4 whitespace-nowrap ${
                activeSubTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'info' ? '기본 정보' : tab === 'rooms' ? '객실 관리' : tab === 'faq' ? 'FAQ' : '외부 연동 (Sheets)'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-10">
        {activeSubTab === 'info' && (
          <div className="space-y-8 max-w-2xl">
            <UserSettingsForm initialSettings={userSettings} onSave={onUpdateSettings} />
          </div>
        )}

        {activeSubTab === 'integration' && (
          <div className="space-y-8 max-w-3xl">
            <div>
              <h3 className="text-2xl font-black text-slate-800 flex items-center">
                <span className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mr-4">📊</span>
                구글 시트 실시간 연동
              </h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                상담 기록을 구글 시트에 자동으로 저장하고 관리합니다.<br/>
                연동에 필요한 두 가지 URL을 입력해 주세요.
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  Google Apps Script Webhook URL
                </label>
                <input 
                  type="url" 
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm mb-6"
                  value={userSettings.googleSheetsUrl || ''}
                  onChange={(e) => onUpdateSettings({...userSettings, googleSheetsUrl: e.target.value})}
                />

                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  Google Spreadsheet 주소 (View URL)
                </label>
                <div className="flex gap-3">
                  <input 
                    type="url" 
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="flex-1 px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-sm"
                    value={userSettings.googleSpreadsheetUrl || ''}
                    onChange={(e) => onUpdateSettings({...userSettings, googleSpreadsheetUrl: e.target.value})}
                  />
                  <button 
                    onClick={() => {
                      if(userSettings.googleSpreadsheetUrl) window.open(userSettings.googleSpreadsheetUrl, '_blank');
                    }}
                    className="px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-lg active:scale-95 whitespace-nowrap"
                  >
                    시트 열기
                  </button>
                </div>
                
                <div className="mt-8 bg-indigo-50 p-5 rounded-2xl border border-indigo-100 flex items-start space-x-3">
                  <span className="text-xl">🛠️</span>
                  <div className="text-xs text-indigo-700 leading-relaxed">
                    <p className="font-bold mb-1">설정 가이드:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>구글 시트 생성 후 <b>도구 {'>'} 스크립트 편집기</b>를 엽니다.</li>
                      <li>POST 요청을 받아 시트에 기록하는 코드를 작성합니다.</li>
                      <li><b>배포 {'>'} 새 배포 {'>'} 웹 앱</b>으로 배포하고 생성된 URL을 위 'Webhook URL'에 입력하세요.</li>
                      <li>시트 브라우저 주소를 'View URL'에 입력하면 앱에서 바로 열기가 가능합니다.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8">
               <h4 className="text-sm font-bold text-slate-700 mb-4">현재 연동 상태</h4>
               <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${userSettings.googleSheetsUrl ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <span className="text-sm font-bold text-slate-600">Webhook: {userSettings.googleSheetsUrl ? '연결됨' : '미설정'}</span>
                  </div>
                  <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
                    <div className={`w-3 h-3 rounded-full ${userSettings.googleSpreadsheetUrl ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                    <span className="text-sm font-bold text-slate-600">Spreadsheet: {userSettings.googleSpreadsheetUrl ? '연결됨' : '미설정'}</span>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeSubTab === 'rooms' && (
          <div className="py-10 text-center text-slate-400 italic">객실 관리 기능은 Pro 플랜에서 제공됩니다.</div>
        )}
        {activeSubTab === 'faq' && (
          <div className="py-10 text-center text-slate-400 italic">FAQ 스크립트 관리 화면입니다.</div>
        )}
      </div>
    </div>
  );
};
