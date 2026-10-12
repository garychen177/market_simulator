export interface DebriefQuestion {
  group: string;
  text: string;
}

export const DEBRIEF: DebriefQuestion[] = [
  { group: 'Understanding the situation', text: 'When the market closed, who still had food, and why?' },
  { group: 'Understanding the situation', text: "Was the city's shortage caused by too little food being grown, or by food not reaching people?" },
  { group: 'Understanding the situation', text: "Somchai's income barely changed during COVID, but people went hungry. How can both be true?" },
  { group: 'Trade-offs', text: 'In normal seasons, which farmer fed the city better? In a crisis, which one did? What does that tell you about affordability versus resilience?' },
  { group: 'Trade-offs', text: "Mae Tha's farmer waited a season for the soil to recover and kept food back for the reserve. Was that cost worth it? For whom?" },
  { group: 'Policy', text: 'Which policy reduced the shortage most, and who pays for it?' },
  { group: 'Policy', text: 'If you were on the Chiang Mai Food Council, what would you do before the next flood?' },
  { group: 'Reflection', text: 'What surprised you? What would you ask a Mae Tha farmer or a contract farmer if you met them?' },
];

const KEY = 'two-farmers-debrief-v1';

export function loadAnswers(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) return DEBRIEF.map((_, i) => (typeof parsed[i] === 'string' ? parsed[i] : ''));
  } catch {
    // storage unavailable: start empty
  }
  return DEBRIEF.map(() => '');
}

export function saveAnswers(answers: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(answers));
  } catch {
    // storage unavailable: answers stay in memory only
  }
}

export function answersToText(answers: string[]): string {
  const lines = ['Two Farmers, One City: debrief answers', ''];
  DEBRIEF.forEach((q, i) => {
    lines.push(`${i + 1}. [${q.group}] ${q.text}`, answers[i]?.trim() || '(no answer)', '');
  });
  return lines.join('\n');
}
