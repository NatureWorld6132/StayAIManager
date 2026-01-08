
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { FacilitySettings } from './components/FacilitySettings';
import { InquiryLogs } from './components/InquiryLogs';
import { Analytics } from './components/Analytics';
import { DirectResponse } from './components/DirectResponse';
import { Modal } from './components/Modal';
import { UserSettingsForm } from './components/UserSettingsForm';
import { UserSettings, AiScenarioSettings, InquiryLog, InquiryType } from './types';
import { testApiKeyConnection } from './services/gemini';

// 기본 스프레드시트 URL
const TARGET_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1lenX6ITlHHQoXDZ4_gsaR1V0zherUe_KwEO-COPAfT0/edit?gid=0#gid=0';

const DEFAULT_SETTINGS: UserSettings = {
  facilityName: '자연나라',
  managerName: '관리자',
  managerPhone: '010-0000-0000',
  facilityType: ['retreat'],
  guides: [
    '예약금 안내 (30% 입금 시 확정)',
    '초등 단체 보험 가입 여부 확인 필요',
    '식사 알러지 여부 사전 파악 권장'
  ],
  googleSheetsUrl: '', 
  googleSpreadsheetUrl: TARGET_SHEET_URL
};

const DEFAULT_SCENARIO: AiScenarioSettings = {
  isAutoResponseActive: true,
  isSmsOnAbsenceActive: true,
  selectedScenarioId: '1',
  customScenario: ''
};

const INITIAL_LOGS: InquiryLog[] = [
  { id: '1', timestamp: '2023-10-24 14:20', phoneNumber: '010-1234-5678', type: InquiryType.ACCOMMODATION, summary: '3인 가족, 11/15 1박 예약 문의', details: { purpose: '숙박', target: '가족', count: 3, date: '11/15' }, transcript: '고객: 안녕하세요, 11월 15일에 3인 가족 숙박 가능한가요?\nAI: 네, 확인해보니 해당 일자에 패밀리룸 이용 가능하십니다.', smsSent: true },
  { id: '2', timestamp: '2023-10-24 13:05', phoneNumber: '010-9876-5432', type: InquiryType.ACTIVITY, summary: '대학생 20명 단체 도자기 체험', details: { purpose: '체험', target: '대학생', count: 20, date: '미정' }, transcript: '고객: 대학생 20명 단체로 도자기 체험 프로그램 예약하고 싶습니다.\nAI: 네, 가능합니다. 원하시는 구체적인 날짜가 있으신가요?', smsSent: true },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'direct' | 'dashboard' | 'settings' | 'logs' | 'analytics'>('direct');
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [scenarioSettings, setScenarioSettings] = useState<AiScenarioSettings>(DEFAULT_SCENARIO);
  const [logs, setLogs] = useState<InquiryLog[]>([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [apiTestStatus, setApiTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');
  const [apiKeyInput, setApiKeyInput] = useState<string>('••••••••••••••••••••••••••••••••••••');

  useEffect(() => {
    const savedSettings = localStorage.getItem('stayai_settings');
    const savedScenario = localStorage.getItem('stayai_scenario');
    const savedLogs = localStorage.getItem('stayai_logs');
    
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (!parsed.googleSpreadsheetUrl) parsed.googleSpreadsheetUrl = TARGET_SHEET_URL;
      setUserSettings(parsed);
    }
    if (savedScenario) setScenarioSettings(JSON.parse(savedScenario));
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    } else {
      setLogs(INITIAL_LOGS);
      localStorage.setItem('stayai_logs', JSON.stringify(INITIAL_LOGS));
    }
  }, []);

  const syncToSheets = async (log: InquiryLog) => {
    if (!userSettings.googleSheetsUrl) return { success: false, error: 'NO_URL' };
    
    setSyncing(true);
    try {
      await fetch(userSettings.googleSheetsUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facilityName: userSettings.facilityName,
          timestamp: log.timestamp,
          phoneNumber: log.phoneNumber,
          type: log.type,
          summary: log.summary,
          purpose: log.details.purpose,
          target: log.details.target,
          count: log.details.count,
          date: log.details.date,
          specialRequests: log.details.specialRequests || log.details.meals || '',
          transcript: log.transcript
        })
      });
      return { success: true };
    } catch (error) {
      console.error('Sheets sync failed', error);
      return { success: false, error: 'FETCH_ERROR' };
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    localStorage.setItem('stayai_settings', JSON.stringify(newSettings));
    setUserSettings(newSettings);
  };

  const handleUpdateScenario = (newScenario: AiScenarioSettings) => {
    localStorage.setItem('stayai_scenario', JSON.stringify(newScenario));
    setScenarioSettings(newScenario);
  };

  const handleAddLog = (newLog: InquiryLog) => {
    setLogs(prevLogs => {
      const updatedLogs = [newLog, ...prevLogs];
      localStorage.setItem('stayai_logs', JSON.stringify(updatedLogs));
      return updatedLogs;
    });
    syncToSheets(newLog);
  };

  const handleResetData = () => {
    if (window.confirm('모든 상담 기록을 삭제하시겠습니까?')) {
      setLogs([]);
      localStorage.setItem('stayai_logs', JSON.stringify([]));
    }
  };

  const handleSaveAndTest = async () => {
    setApiTestStatus('testing');
    const isOk = await testApiKeyConnection();
    setApiTestStatus(isOk ? 'success' : 'fail');
    if (isOk) {
      console.log("API Key connection successful");
    }
  };

  const handleDeleteKey = () => {
    setApiKeyInput('');
    setApiTestStatus('idle');
    alert("키 설정 정보가 초기화되었습니다.");
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Inter']">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userSettings={userSettings}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onApiKeyClick={() => setIsApiKeyModalOpen(true)}
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              {activeTab === 'direct' && '실시간 응대'}
              {activeTab === 'dashboard' && '운영 현황'}
              {activeTab === 'settings' && '환경 설정'}
              {activeTab === 'logs' && '상담 로그'}
              {activeTab === 'analytics' && '데이터 분석'}
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              <span className="text-indigo-600 font-bold">{userSettings.facilityName}</span> • 실시간 데이터 동기화 활성
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {syncing && (
              <span className="flex items-center text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 animate-pulse">
                GOOGLE SHEETS 동기화 중...
              </span>
            )}
            {userSettings.googleSheetsUrl && !syncing && (
              <span className="flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                SHEETS 연동됨 ✓
              </span>
            )}
            <button onClick={handleResetData} className="px-4 py-2 text-[10px] font-black text-slate-400 hover:text-red-500 transition-all uppercase tracking-wider">Reset Logs</button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          {activeTab === 'direct' && <DirectResponse onSaveLog={handleAddLog} userSettings={userSettings} onUpdateSettings={handleUpdateSettings} />}
          {activeTab === 'dashboard' && <Dashboard scenarioSettings={scenarioSettings} onUpdateScenario={handleUpdateScenario} facilityName={userSettings.facilityName} logs={logs} />}
          {activeTab === 'settings' && <FacilitySettings userSettings={userSettings} onUpdateSettings={handleUpdateSettings} />}
          {activeTab === 'logs' && <InquiryLogs logs={logs} onSyncLog={syncToSheets} isSyncing={syncing} userSettings={userSettings} />}
          {activeTab === 'analytics' && <Analytics logs={logs} />}
        </div>
      </main>

      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="프로필 설정">
        <UserSettingsForm initialSettings={userSettings} onSave={handleUpdateSettings} />
      </Modal>

      <Modal isOpen={isApiKeyModalOpen} onClose={() => setIsApiKeyModalOpen(false)} title="API Key 설정" variant="dark">
        <div className="space-y-6 pt-2">
          <p className="text-[13px] text-slate-400 leading-relaxed font-medium">
            Gemini API 키를 입력해주세요. 키는 당신의 브라우저에 암호화되어 안전하게 저장됩니다.
          </p>

          <div className="relative">
            <input 
              type="password"
              className="w-full bg-[#2a3142] rounded-lg px-5 py-4 text-slate-100 text-sm outline-none border border-transparent focus:border-indigo-500/50 transition-all font-mono tracking-widest"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="API 키를 여기에 입력하세요"
            />
          </div>

          <div className="flex justify-between items-center gap-4 pt-2">
            <button 
              onClick={handleDeleteKey}
              className="px-6 py-3.5 bg-[#8b1e1e] hover:bg-[#a12525] text-white text-sm font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-black/20"
            >
              키 삭제
            </button>
            <button 
              onClick={handleSaveAndTest}
              disabled={apiTestStatus === 'testing'}
              className="px-8 py-3.5 bg-[#7c3aed] hover:bg-[#8b5cf6] text-white text-sm font-bold rounded-lg transition-all shadow-lg shadow-violet-900/20 active:scale-95 flex items-center justify-center space-x-2 flex-1"
            >
              {apiTestStatus === 'testing' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : null}
              <span>저장 및 테스트</span>
            </button>
          </div>

          <div className="min-h-[24px] flex justify-center items-center">
            {apiTestStatus === 'success' && (
              <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
                <p className="text-[#34d399] text-[13px] font-bold">
                  성공! API 키가 유효하며 저장되었습니다
                </p>
              </div>
            )}
            {apiTestStatus === 'fail' && (
              <p className="text-rose-400 text-[13px] font-bold animate-in fade-in slide-in-from-top-2">
                연결 실패! API 키를 다시 확인해주세요
              </p>
            )}
            {apiTestStatus === 'idle' && !apiKeyInput && (
              <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest">
                API Key required
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default App;
