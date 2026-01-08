
import { GoogleGenAI, Type } from "@google/genai";

/**
 * API 키 연결 테스트
 * 최신 가이드라인에 따라 매 호출 시 인스턴스를 생성하여 최신 API 키가 반영되도록 합니다.
 */
export async function testApiKeyConnection() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'connection_test_ping',
      config: {
        maxOutputTokens: 10,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });
    
    // response.text property를 직접 사용 (not a method)
    return response.text !== undefined;
  } catch (e) {
    console.error("API Key Test Failed:", e);
    return false;
  }
}

/**
 * 대화 내용에서 문의 상세 정보 추출
 */
export async function extractInquiryDetails(transcript: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract inquiry details from this customer conversation: "${transcript}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          purpose: { type: Type.STRING, description: 'Purpose of inquiry (e.g., Accommodation, Activity)' },
          target: { type: Type.STRING, description: 'Target group (e.g., Family, Students, Corporate)' },
          count: { type: Type.NUMBER, description: 'Number of people' },
          date: { type: Type.STRING, description: 'Desired date or period' },
          specialRequests: { type: Type.STRING, description: 'Any special requests or notes' },
          summary: { type: Type.STRING, description: 'A one-line summary for SMS' }
        },
        required: ['purpose', 'count', 'date', 'summary']
      }
    }
  });

  const jsonStr = response.text?.trim();
  if (!jsonStr) return null;

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse AI response as JSON", e);
    return null;
  }
}

/**
 * 시설 맞춤형 일정을 생성하여 캘린더 연동 시뮬레이션
 */
export async function fetchMockSyncedEvents(facilityName: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const today = new Date().toLocaleDateString();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 4 realistic Google Calendar events for a facility named "${facilityName}" occurring today (${today}). 
    Each event should be for a group booking.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: 'Group name and count, e.g., "서울초교 50명"' },
            time: { type: Type.STRING, description: 'Format: HH:mm - HH:mm' },
            type: { type: Type.STRING, enum: ['입실', '퇴실', '점검', '기타'] },
            color: { type: Type.STRING, description: 'Tailwind color name: indigo, amber, emerald, or rose' },
            description: { type: Type.STRING }
          },
          required: ['id', 'title', 'time', 'type', 'color']
        }
      }
    }
  });

  const jsonStr = response.text?.trim();
  if (!jsonStr) return [];

  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse calendar events", e);
    return [];
  }
}
