
import React, { useState } from 'react';
import { UserSettings } from '../types';

interface OnboardingProps {
  onComplete: (settings: UserSettings) => void;
}

const FACILITY_OPTIONS = [
  { id: 'pension', label: '펜션/글램핑' },
  { id: 'retreat', label: '수련원/활동센터' },
  { id: 'workshop', label: '워크샵 공간' },
  { id: 'guesthouse', label: '게스트하우스' },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  // Fixed: Initialize UserSettings with all required properties including 'guides'
  const [formData, setFormData] = useState<UserSettings>({
    facilityName: '',
    managerPhone: '',
    facilityType: [],
    managerName: '',
    guides: []
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleFinish = () => {
    onComplete(formData);
  };

  const toggleFacilityType = (id: string) => {
    setFormData(prev => {
      const current = prev.facilityType || [];
      const updated = current.includes(id)
        ? current.filter(t => t !== id)
        : [...current, id];
      return { ...prev, facilityType: updated };
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-[40px] shadow-2xl shadow-indigo-100 overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-slate-50 p-2 flex space-x-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 flex-1 rounded-full transition-all ${
                s <= step ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            ></div>
          ))}
        </div>

        <div className="p-10">
          {step === 1 && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-3xl flex items-center justify-center text-3xl mb-8">🏨</div>
              <h2 className="text-3xl font-bold text-slate-800">시설 정보를 알려주세요</h2>
              <p className="text-slate-500">AI가 고객 응대를 위해 가장 먼저 알아야 할 기본 정보입니다.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">시설 이름</label>
                  <input 
                    type="text" 
                    placeholder="예: 푸른솔 수련원"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.facilityName}
                    onChange={(e) => setFormData({...formData, facilityName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">시설 유형 (중복 선택 가능)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FACILITY_OPTIONS.map((opt) => (
                      <label 
                        key={opt.id} 
                        className={`flex items-center p-4 rounded-2xl border cursor-pointer transition-all ${
                          formData.facilityType?.includes(opt.id) 
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200' 
                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                          checked={formData.facilityType?.includes(opt.id)}
                          onChange={() => toggleFacilityType(opt.id)}
                        />
                        <span className="text-sm font-bold">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center text-3xl mb-8">📱</div>
              <h2 className="text-3xl font-bold text-slate-800">요약 전송 번호 등록</h2>
              <p className="text-slate-500">AI가 파악한 고객 정보를 어떤 번호로 보내드릴까요?</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">담당자 성함</label>
                  <input 
                    type="text" 
                    placeholder="예: 김관리"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.managerName}
                    onChange={(e) => setFormData({...formData, managerName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">휴대폰 번호</label>
                  <input 
                    type="tel" 
                    placeholder="010-0000-0000"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.managerPhone}
                    onChange={(e) => setFormData({...formData, managerPhone: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 animate-bounce">✨</div>
              <h2 className="text-3xl font-bold text-slate-800">준비가 완료되었습니다!</h2>
              <p className="text-slate-500">이제 고객이 전화하면 AI가 정중하게 응대하고<br/>핵심 정보를 관리자님께 바로 요약해서 보내드립니다.</p>
              
              <div className="bg-slate-50 p-6 rounded-3xl text-left border border-slate-100 mt-8">
                <h4 className="font-bold text-slate-700 mb-2">AI 시나리오 자동 생성됨:</h4>
                <ul className="text-sm text-slate-500 space-y-2">
                  <li>✓ {formData.facilityName} 소개 및 인사</li>
                  <li>✓ 문의 목적 확인 (숙박/체험/기타)</li>
                  <li>✓ 인원 및 일정 파악</li>
                  <li>✓ {formData.managerName}님께 실시간 요약 발송</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-12 flex space-x-3">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
              >
                이전으로
              </button>
            )}
            <button 
              onClick={step === 3 ? handleFinish : nextStep}
              className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
            >
              {step === 3 ? '시작하기' : '다음 단계로'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
