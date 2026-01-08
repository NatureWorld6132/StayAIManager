
import React, { useState } from 'react';
import { extractInquiryDetails } from '../services/gemini';
import { InquiryLog, InquiryType } from '../types';

interface CallSimulatorProps {
  onSaveToLogs?: (log: InquiryLog) => void;
}

export const CallSimulator: React.FC<CallSimulatorProps> = ({ onSaveToLogs }) => {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [smsSent, setSmsSent] = useState(false);
  const [isSavedToLogs, setIsSavedToLogs] = useState(false);

  const simulateCall = async () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    setResult(null);
    setSmsSent(false);
    setIsSavedToLogs(false);

    try {
      const details = await extractInquiryDetails(transcript);
      setResult(details);
      
      // Simulate SMS delay
      setTimeout(() => {
        setSmsSent(true);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToHistory = () => {
    if (!result || !onSaveToLogs) return;

    const newLog: InquiryLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      phoneNumber: '010-시뮬레이션-테스트',
      type: result.purpose?.includes('숙박') ? InquiryType.ACCOMMODATION : InquiryType.ACTIVITY,
      summary: result.summary,
      details: {
        purpose: result.purpose,
        target: result.target,
        count: result.count,
        date: result.date,
        specialRequests: result.specialRequests
      },
      transcript: `[AI 자동 응대 시뮬레이션]\n\n고객 발화 내용:\n${transcript}\n\nAI 분석 결과:\n${JSON.stringify(result, null, 2)}`,
      smsSent: true
    };

    onSaveToLogs(newLog);
    setIsSavedToLogs(true);
  };

  const templates = [
    "안녕하세요, 자연나라 수련원이죠? 다음 달 15일에 저희 대학교 동아리에서 30명 정도 워크샵을 가려고 하는데, 숙박이랑 저녁 바비큐 가능할까요?",
    "펜션 예약 문의하려고 하는데요. 7월 첫째주 주말에 가족 4명이서 갈 건데 강아지도 같이 갈 수 있는지 궁금합니다.",
    "초등학생 체험학습 문의드립니다. 50명 정도 단체로 숲 체험이랑 도자기 만들기 체험 하고 싶은데 비용이 어떻게 되나요?"
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold text-slate-800 mb-2">테스트 전화 시뮬레이터</h3>
        <p className="text-slate-500 text-sm mb-6">고객의 음성이 텍스트로 변환되었다고 가정하고 AI의 분석 능력을 테스트합니다.</p>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {templates.map((t, i) => (
              <button 
                key={i}
                onClick={() => setTranscript(t)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full transition-colors font-bold"
              >
                샘플 {i + 1}
              </button>
            ))}
          </div>

          <textarea
            className="w-full h-40 p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700 font-medium"
            placeholder="고객의 음성 스크립트를 입력하거나 샘플을 선택하세요..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          ></textarea>

          <button 
            onClick={simulateCall}
            disabled={isProcessing || !transcript}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${
              isProcessing ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100'
            }`}
          >
            {isProcessing ? 'AI 분석 중...' : 'AI 응대 시뮬레이션 시작'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {result ? (
          <>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mr-3 text-sm">🧠</span>
                  AI 추출 핵심 정보
                </h3>
                {!isSavedToLogs ? (
                  <button 
                    onClick={handleSaveToHistory}
                    className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl hover:bg-indigo-100 transition-all border border-indigo-100"
                  >
                    문의 기록으로 저장
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                    저장 완료 ✓
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs text-slate-400 font-bold mb-1 uppercase">문의 목적</p>
                  <p className="font-bold text-slate-800">{result.purpose}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs text-slate-400 font-bold mb-1 uppercase">대상</p>
                  <p className="font-bold text-slate-800">{result.target || '미지정'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs text-slate-400 font-bold mb-1 uppercase">인원</p>
                  <p className="font-bold text-slate-800">{result.count}명</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-xs text-slate-400 font-bold mb-1 uppercase">일정</p>
                  <p className="font-bold text-slate-800">{result.date}</p>
                </div>
              </div>

              {result.specialRequests && (
                <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-xs text-amber-600 font-bold mb-1 uppercase">특이사항/요청</p>
                  <p className="text-sm text-slate-700 font-medium">{result.specialRequests}</p>
                </div>
              )}
            </div>

            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center">
                  <span className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center mr-3 text-sm">💬</span>
                  담당자 SMS 요약 미리보기
                </h3>
                {smsSent && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-bold">발송 완료</span>
                )}
              </div>
              
              <div className="relative">
                <div className="bg-slate-800 p-6 rounded-2xl font-mono text-sm leading-relaxed border border-slate-700">
                  <p className="text-slate-400 mb-2">[StayAI 알림]</p>
                  <p className="text-indigo-300 font-bold mb-1">문의: {result.summary}</p>
                  <p>번호: 010-시뮬레이션-테스트</p>
                  <p className="mt-2 text-slate-500 text-xs italic">※ 관리자 앱 '문의 기록' 탭에서 대화 내용을 확인하세요.</p>
                </div>
                {smsSent && (
                  <div className="absolute -right-2 -top-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center text-slate-400 p-12 text-center">
            <div className="text-6xl mb-4">📡</div>
            <p className="font-bold">응대 시뮬레이션을 시작하면<br/>AI가 추출한 정보가 이곳에 표시됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};
