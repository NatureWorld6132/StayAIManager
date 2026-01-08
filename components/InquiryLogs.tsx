
import React, { useState } from 'react';
import { InquiryLog, InquiryType, UserSettings } from '../types';
import { Modal } from './Modal';

interface InquiryLogsProps {
  logs: InquiryLog[];
  onSyncLog?: (log: InquiryLog) => Promise<{ success: boolean; error?: string }>;
  isSyncing?: boolean;
  userSettings?: UserSettings;
}

export const InquiryLogs: React.FC<InquiryLogsProps> = ({ logs, onSyncLog, isSyncing, userSettings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<InquiryLog | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState(false);

  const filteredLogs = logs.filter(log => 
    log.phoneNumber.includes(searchTerm) || 
    log.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleManualSync = async (log: InquiryLog) => {
    if (!onSyncLog) return;
    const targetUrl = 'https://docs.google.com/spreadsheets/d/1lenX6ITlHHQoXDZ4_gsaR1V0zherUe_KwEO-COPAfT0/edit?gid=0#gid=0';
    const sheetUrl = userSettings?.googleSpreadsheetUrl || targetUrl;
    window.open(sheetUrl, '_blank');

    setSyncStatus('syncing');
    const result = await onSyncLog(log);
    
    if (result.success) {
      setSyncStatus('done');
    } else if (result.error === 'NO_URL') {
      setSyncStatus('error_no_url');
      alert('설정(시설 설정 > 외부 연동)에서 구글 시트 Webhook URL을 등록해야 합니다.');
    } else {
      setSyncStatus('');
      alert('데이터 전송 중 오류가 발생했습니다.');
    }
  };

  const handleCopyMemo = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
          <input
            type="text"
            placeholder="번호, 문의내용, 유형 등으로 검색..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => setSearchTerm('')}
            className="bg-white border border-slate-100 px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm active:scale-95 transition-all"
          >
            필터 초기화
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.15em]">
              <tr>
                <th className="px-8 py-5">시간</th>
                <th className="px-8 py-5">고객번호</th>
                <th className="px-8 py-5">유형</th>
                <th className="px-8 py-5">핵심 요약</th>
                <th className="px-8 py-5">상태</th>
                <th className="px-8 py-5 text-center">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-6 text-xs text-slate-400 font-medium whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-800">{log.phoneNumber}</td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                      log.type === InquiryType.DIRECT ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      log.type === InquiryType.ACCOMMODATION ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                      log.type === InquiryType.ACTIVITY ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm text-slate-600 max-w-xs truncate font-medium">{log.summary}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-emerald-600 text-[10px] font-bold">완료</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="text-indigo-600 font-bold text-xs hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 italic text-sm">
                    검색 결과가 없거나 기록된 응대 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!selectedLog}
        onClose={() => {
          setSelectedLog(null);
          setSyncStatus('');
        }}
        title="상담 브리핑 메모 (Memo)"
      >
        {selectedLog && (
          <div className="space-y-6">
            {/* Notepad UI */}
            <div className="relative group">
              <div className="absolute inset-0 bg-yellow-100/30 rounded-[32px] transform rotate-1 transition-transform group-hover:rotate-0"></div>
              <div className="relative bg-[#fefce8] rounded-[32px] p-8 shadow-xl border border-yellow-200/50 min-h-[400px] flex flex-col">
                {/* Notepad Header */}
                <div className="flex justify-between items-start mb-6 border-b border-yellow-200 pb-4">
                  <div>
                    <h4 className="text-[10px] font-black text-yellow-600 uppercase tracking-[0.2em] mb-1">StayAI Official Briefing</h4>
                    <p className="text-xs font-bold text-slate-400">{selectedLog.timestamp}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800">{selectedLog.phoneNumber}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedLog.type}</p>
                  </div>
                </div>

                {/* Notepad Body (Briefing Content) */}
                <div className="flex-1 relative">
                  {/* Subtle Notebook Lines */}
                  <div className="absolute inset-0 pointer-events-none" style={{ 
                    backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px)', 
                    backgroundSize: '100% 2.5rem',
                    backgroundPosition: '0 1.5rem' 
                  }}></div>
                  
                  <div className="relative z-10 font-mono text-sm leading-[2.5rem] text-slate-700 whitespace-pre-wrap pt-2">
                    {selectedLog.transcript || "브리핑 정보가 없습니다."}
                  </div>
                </div>

                {/* Notepad Footer */}
                <div className="mt-8 pt-4 border-t border-yellow-200 flex justify-between items-center">
                   <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Log</span>
                   </div>
                   <button 
                    onClick={() => handleCopyMemo(selectedLog.transcript)}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-xl hover:bg-yellow-500 transition-all font-bold text-xs shadow-md shadow-yellow-900/10 active:scale-95"
                   >
                     <span>{copyFeedback ? '✓ Copied' : '📋 메모 복사'}</span>
                   </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center pt-2 gap-3">
               <button 
                onClick={() => handleManualSync(selectedLog)}
                disabled={syncStatus === 'syncing'}
                className={`w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all border ${
                  syncStatus === 'done' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-95'
                }`}
               >
                 <span>
                  {syncStatus === 'syncing' ? '⌛ 전송 중...' : 
                   syncStatus === 'done' ? '✓ 시트 저장됨' : '📊 구글 Sheet로 전송'}
                 </span>
               </button>
            </div>
          </div>
        )}
      </Modal>

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
