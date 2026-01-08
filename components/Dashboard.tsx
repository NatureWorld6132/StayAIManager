
import React, { useState } from 'react';
import { Modal } from './Modal';
import { AiScenarioSettings, InquiryLog, InquiryType } from '../types';

interface DashboardProps {
  scenarioSettings: AiScenarioSettings;
  onUpdateScenario: (settings: AiScenarioSettings) => void;
  facilityName: string;
  logs: InquiryLog[];
}

export const Dashboard: React.FC<DashboardProps> = ({ scenarioSettings, onUpdateScenario, facilityName, logs }) => {
  const [activeModal, setActiveModal] = useState<'ai_calls' | 'sms_logs' | 'all_logs' | 'scenario_edit' | null>(null);
  const [localScenario, setLocalScenario] = useState<AiScenarioSettings>(scenarioSettings);

  const directLogs = logs.filter(l => l.type === InquiryType.DIRECT);
  const aiLogs = logs.filter(l => l.type !== InquiryType.DIRECT);

  const stats = [
    { id: 'total_calls', label: '오늘의 총 응대', value: `${logs.length}건`, change: '통합 현황', color: 'indigo' },
    { id: 'ai_calls', label: 'AI 자동 응대', value: `${aiLogs.length}건`, change: 'AI 엔진', color: 'blue' },
    { id: 'direct_calls', label: '직원 직접 응대', value: `${directLogs.length}건`, change: '실시간 기록', color: 'emerald' },
    { id: 'sms_logs', label: '전송된 요약 문자', value: `${logs.filter(l => l.smsSent).length}건`, change: '알림 완료', color: 'amber' },
  ];

  const RECOMMENDED_SCENARIOS = [
    { id: '1', title: '친절한 예약 안내형', content: `안녕하세요, ${facilityName}입니다. 현재 전화 연결이 어려워 AI가 대신 응대해 드리고 있습니다. 예약 일자와 인원을 말씀해 주시면 확인 후 담당자가 즉시 연락드리겠습니다.` },
    { id: '2', title: '전문적인 비즈니스형', content: `반갑습니다. ${facilityName} 비즈니스 센터입니다. 원활한 시설 이용 안내를 위해 문의하시는 단체명과 예상 이용 인원, 날짜를 차례대로 말씀 부탁드립니다.` },
    { id: '3', title: '활동/체험 중심형', content: `아이들의 웃음이 가득한 ${facilityName} 체험센터입니다! 어떤 체험 프로그램이 궁금하신가요? 희망하시는 체험 종류와 인원수를 말씀해 주세요.` },
    { id: '4', title: '간결한 정보 전달형', content: `${facilityName} AI 예약 비서입니다. 숙박 또는 시설 문의 중 무엇을 도와드릴까요? 간단히 용건을 말씀해 주시면 요약하여 담당자에게 전달하겠습니다.` },
    { id: '5', title: '부드러운 감성형', content: `잠시 쉬어가는 공간, ${facilityName}입니다. 정성스런 응대를 위해 담당자 연결 전 정보를 파악하고 있습니다. 편하게 문의 내용을 말씀해 주세요.` },
  ];

  const handleToggle = (key: keyof Pick<AiScenarioSettings, 'isAutoResponseActive' | 'isSmsOnAbsenceActive'>) => {
    const updated = { ...scenarioSettings, [key]: !scenarioSettings[key] };
    onUpdateScenario(updated);
  };

  const handleSaveScenario = () => {
    onUpdateScenario(localScenario);
    setActiveModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.id} 
            className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 transition-all hover:scale-[1.02]`}
          >
            <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
                stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">최근 응대 로그 (통합)</h3>
            <button 
              onClick={() => setActiveModal('all_logs')}
              className="text-sm text-indigo-600 font-semibold hover:underline bg-indigo-50 px-3 py-1 rounded-lg"
            >
              전체 보기
            </button>
          </div>
          <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
            {logs.length > 0 ? logs.slice(0, 10).map((item) => (
              <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.type === InquiryType.DIRECT ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {item.type === InquiryType.DIRECT ? '직접응대' : item.type}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{item.phoneNumber}</span>
                  </div>
                  <span className="text-xs text-slate-400">{item.timestamp}</span>
                </div>
                <p className="text-slate-600 text-sm mb-2">{item.summary}</p>
                <div className="flex items-center text-[10px] text-emerald-600 font-bold">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  완료
                </div>
              </div>
            )) : (
              <div className="p-20 text-center text-slate-400 italic text-sm">기록된 응대 내역이 없습니다.</div>
            )}
          </div>
        </div>

        {/* Quick Config / Status */}
        <div className="space-y-6">
          <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-lg shadow-indigo-200">
            <h3 className="text-lg font-bold mb-4">AI 응대 모드</h3>
            <div className="space-y-4">
              <div 
                onClick={() => handleToggle('isAutoResponseActive')}
                className="flex items-center justify-between p-3 bg-white/10 rounded-2xl cursor-pointer hover:bg-white/20 transition-all"
              >
                <span className="text-sm font-medium">자동 응답 활성화</span>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${scenarioSettings.isAutoResponseActive ? 'bg-emerald-400' : 'bg-slate-500'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${scenarioSettings.isAutoResponseActive ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
              <div 
                onClick={() => handleToggle('isSmsOnAbsenceActive')}
                className="flex items-center justify-between p-3 bg-white/10 rounded-2xl cursor-pointer hover:bg-white/20 transition-all"
              >
                <span className="text-sm font-medium">부재중 즉시 문자 발송</span>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${scenarioSettings.isSmsOnAbsenceActive ? 'bg-emerald-400' : 'bg-slate-500'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${scenarioSettings.isSmsOnAbsenceActive ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                setLocalScenario(scenarioSettings);
                setActiveModal('scenario_edit');
              }}
              className="w-full mt-6 py-3 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-colors shadow-sm"
            >
              AI 응대 시나리오 수정
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4">오늘의 예약 분포</h3>
            <div className="space-y-3">
              {[
                { name: '숙박/시설', percent: 65, color: 'bg-indigo-500' },
                { name: '체험활동', percent: 25, color: 'bg-amber-500' },
                { name: '기타문의', percent: 10, color: 'bg-slate-400' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="text-slate-400">{item.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`${item.color} h-full`} style={{ width: `${item.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={activeModal === 'all_logs'} 
        onClose={() => setActiveModal(null)}
        title="전체 통합 응대 로그"
      >
        <div className="space-y-4">
          <div className="relative mb-6">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text" 
              placeholder="로그 검색..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
            />
          </div>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {logs.map((item) => (
              <div key={item.id} className="p-5 border border-slate-100 rounded-2xl hover:border-indigo-100 hover:bg-indigo-50/10 transition-all">
                <div className="flex justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    item.type === InquiryType.DIRECT ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{item.timestamp}</span>
                </div>
                <p className="text-sm font-bold text-slate-800 mb-1">{item.phoneNumber}</p>
                <p className="text-sm text-slate-600">{item.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'scenario_edit'} 
        onClose={() => setActiveModal(null)}
        title="AI 응대 시나리오 설정"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button 
              onClick={() => setLocalScenario({...localScenario, isAutoResponseActive: !localScenario.isAutoResponseActive})}
              className={`p-4 rounded-2xl border-2 transition-all text-left flex justify-between items-center ${localScenario.isAutoResponseActive ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100'}`}
            >
              <div>
                <p className="text-sm font-bold text-slate-800">자동 응답</p>
                <p className="text-xs text-slate-500">AI가 즉시 응답</p>
              </div>
              <div className={`w-8 h-4 rounded-full relative ${localScenario.isAutoResponseActive ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${localScenario.isAutoResponseActive ? 'right-0.5' : 'left-0.5'}`}></div>
              </div>
            </button>
            <button 
              onClick={() => setLocalScenario({...localScenario, isSmsOnAbsenceActive: !localScenario.isSmsOnAbsenceActive})}
              className={`p-4 rounded-2xl border-2 transition-all text-left flex justify-between items-center ${localScenario.isSmsOnAbsenceActive ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100'}`}
            >
              <div>
                <p className="text-sm font-bold text-slate-800">즉시 문자 알림</p>
                <p className="text-xs text-slate-500">부재중 발생 시 전송</p>
              </div>
              <div className={`w-8 h-4 rounded-full relative ${localScenario.isSmsOnAbsenceActive ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${localScenario.isSmsOnAbsenceActive ? 'right-0.5' : 'left-0.5'}`}></div>
              </div>
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-700">추천 시나리오 템플릿</h4>
            <div className="grid grid-cols-1 gap-2">
              {RECOMMENDED_SCENARIOS.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setLocalScenario({...localScenario, selectedScenarioId: template.id})}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${localScenario.selectedScenarioId === template.id ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' : 'border-slate-100 hover:bg-slate-50'}`}
                >
                  <p className="text-xs font-bold text-indigo-600 mb-1">{template.title}</p>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{template.content}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button 
              onClick={handleSaveScenario}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              시나리오 적용하기
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
