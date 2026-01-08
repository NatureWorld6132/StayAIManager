
import React, { useState } from 'react';
import { UserSettings } from '../types';

interface UserSettingsFormProps {
  initialSettings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

const FACILITY_OPTIONS = [
  { id: 'pension', label: '펜션/글램핑' },
  { id: 'retreat', label: '수련원/활동센터' },
  { id: 'workshop', label: '워크샵 공간' },
  { id: 'guesthouse', label: '게스트하우스' },
];

export const UserSettingsForm: React.FC<UserSettingsFormProps> = ({ initialSettings, onSave }) => {
  const [editInfo, setEditInfo] = useState<UserSettings>(initialSettings);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const handleSave = () => {
    onSave(editInfo);
    setSaveStatus('저장되었습니다!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const toggleFacilityType = (id: string) => {
    setEditInfo(prev => {
      const current = prev.facilityType || [];
      const updated = current.includes(id)
        ? current.filter(t => t !== id)
        : [...current, id];
      return { ...prev, facilityType: updated };
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">시설 명칭</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={editInfo.facilityName}
              onChange={(e) => setEditInfo({...editInfo, facilityName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">시설 유형 (중복 선택 가능)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FACILITY_OPTIONS.map((opt) => (
                <label 
                  key={opt.id} 
                  className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${
                    editInfo.facilityType?.includes(opt.id) 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                      : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                    checked={editInfo.facilityType?.includes(opt.id)}
                    onChange={() => toggleFacilityType(opt.id)}
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">담당자 성함</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={editInfo.managerName}
              onChange={(e) => setEditInfo({...editInfo, managerName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">요약 수신 연락처</label>
            <input 
              type="tel" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={editInfo.managerPhone}
              onChange={(e) => setEditInfo({...editInfo, managerPhone: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 pt-4">
        <button 
          onClick={handleSave}
          className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
        >
          설정 저장하기
        </button>
        {saveStatus && (
          <span className="text-emerald-600 font-bold text-sm animate-bounce">
            ✓ {saveStatus}
          </span>
        )}
      </div>
    </div>
  );
};
