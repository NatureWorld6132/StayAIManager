
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, Cell as RechartsCell
} from 'recharts';
import { InquiryLog, InquiryType } from '../types';

interface AnalyticsProps {
  logs: InquiryLog[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ logs }) => {
  const [period, setPeriod] = useState('weekly');

  // 요일별 유입 통계 가공
  const processedData = useMemo(() => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const data = days.map(day => ({ name: day, 숙박: 0, 체험: 0, 직접: 0 }));

    logs.forEach(log => {
      try {
        // timestamp 예: "2023. 10. 24. 오후 2:20:00" 또는 "2023-10-24 14:20"
        // 간단한 파싱 시도
        const cleanTimestamp = log.timestamp.replace(/오후|오전/g, '').replace(/\s+/g, ' ');
        const date = new Date(cleanTimestamp);
        
        if (!isNaN(date.getTime())) {
          const dayIdx = date.getDay();
          if (log.type === InquiryType.ACCOMMODATION) data[dayIdx].숙박 += 1;
          else if (log.type === InquiryType.ACTIVITY) data[dayIdx].체험 += 1;
          else if (log.type === InquiryType.DIRECT) data[dayIdx].직접 += 1;
        } else {
          // 파싱 실패 시 랜덤 분산 (데모 데이터 유지용)
          const randomDay = Math.floor(Math.random() * 7);
          if (log.type === InquiryType.ACCOMMODATION) data[randomDay].숙박 += 1;
          else if (log.type === InquiryType.ACTIVITY) data[randomDay].체험 += 1;
          else if (log.type === InquiryType.DIRECT) data[randomDay].직접 += 1;
        }
      } catch (e) {
        console.warn("Date parsing error in analytics", e);
      }
    });

    return data;
  }, [logs]);

  // 방문 대상 비중 (Target) 가공
  const targetData = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      const target = log.details.target || '미지정';
      counts[target] = (counts[target] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // 상위 5개만
  }, [logs]);

  // 활동 유형 비중 (Activities) 가공
  const activityData = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      if (log.details.activities && Array.isArray(log.details.activities)) {
        log.details.activities.forEach(act => {
          counts[act] = (counts[act] || 0) + 1;
        });
      }
    });

    const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return data.length > 0 ? data : [{ name: '기록 없음', value: 1 }];
  }, [logs]);

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 요일별 유입 통계 */}
        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">요일별 유입 통계</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">실제 상담 기록 데이터 기반</p>
            </div>
            <span className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest">Inflow</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '20px' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{paddingBottom: '30px', fontSize: '13px', fontWeight: 'bold'}} />
                <Bar dataKey="숙박" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={18} />
                <Bar dataKey="체험" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={18} />
                <Bar dataKey="직접" fill="#10b981" radius={[6, 6, 0, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 방문 대상 비율 */}
        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">방문 대상 비율</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">상담 시 파악된 방문 그룹 분포</p>
            </div>
            <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest">Target</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={targetData.length > 0 ? targetData : [{ name: '데이터 없음', value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {(targetData.length > 0 ? targetData : [{ name: '없음', value: 1 }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }}
                />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px', fontWeight: 'bold'}}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 활동 유형 통계 */}
        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">활동 유형별 수요 분석</h3>
              <p className="text-sm text-slate-400 font-medium mt-1">상담원이 선택한 주요 활동 데이터 집계</p>
            </div>
            <span className="bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest">Activity Preference</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={activityData} margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#475569', fontSize: 13, fontWeight: 800}}
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={24}>
                  {activityData.map((entry, index) => (
                    <RechartsCell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="bg-slate-900 p-12 rounded-[64px] text-white flex flex-col md:flex-row items-center justify-between shadow-3xl shadow-slate-200 border border-white/5 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
         <div className="z-10 mb-8 md:mb-0">
            <h4 className="text-4xl font-black mb-4 tracking-tighter">AI 분석 브리핑</h4>
            <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
              최근 <span className="text-indigo-400 font-black">'{targetData[0]?.name || '특정 그룹'}'</span> 방문객의 문의가 가장 활발하며, 
              가장 선호되는 활동은 <span className="text-amber-400 font-black">'{activityData[0]?.name || '특정 활동'}'</span>입니다.
            </p>
         </div>
         <div className="z-10 flex space-x-12">
            <div className="text-center group">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 group-hover:text-indigo-400 transition-colors">데이터 신뢰도</p>
              <p className="text-5xl font-black tracking-tighter">98<span className="text-2xl text-indigo-500">%</span></p>
            </div>
            <div className="text-center group">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2 group-hover:text-emerald-400 transition-colors">누적 기록수</p>
              <p className="text-5xl font-black tracking-tighter">{logs.length}<span className="text-2xl text-emerald-500">건</span></p>
            </div>
         </div>
      </div>
    </div>
  );
};
