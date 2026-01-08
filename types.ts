
export enum InquiryType {
  ACCOMMODATION = 'ACCOMMODATION',
  FACILITY = 'FACILITY',
  ACTIVITY = 'ACTIVITY',
  GENERAL = 'GENERAL',
  DIRECT = 'DIRECT'
}

export interface AiScenarioSettings {
  isAutoResponseActive: boolean;
  isSmsOnAbsenceActive: boolean;
  selectedScenarioId: string;
  customScenario: string;
}

export interface UserSettings {
  facilityName: string;
  managerName: string;
  managerPhone: string;
  facilityType: string[];
  guides: string[];
  googleSheetsUrl?: string; // Webhook URL (POST target)
  googleSpreadsheetUrl?: string; // View URL (Link target)
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  type: '입실' | '퇴실' | '점검' | '기타';
  color: string;
  description?: string;
}

export interface InquiryLog {
  id: string;
  timestamp: string;
  phoneNumber: string;
  type: InquiryType;
  summary: string;
  details: {
    purpose: string;
    target: string;
    count: number;
    date: string;
    specialRequests?: string;
    meals?: string;
    activities?: string[]; // 추가됨
  };
  transcript: string;
  smsSent: boolean;
}

export interface FacilityInfo {
  name: string;
  rooms: string[];
  facilities: string[];
  services: string[];
  faqs: { question: string; answer: string }[];
}

export interface StatsData {
  name: string;
  value: number;
}
