export type TabType = 'calculator' | 'clicker' | 'obby' | 'codes' | 'trivia' | 'ping';

export type Language = 'id' | 'en';

export interface RedeemCode {
  id: string;
  game: string;
  code: string;
  reward: string;
  status: 'active' | 'expired' | 'new';
  updatedAt: string;
  likes: number;
}

export interface TriviaQuestion {
  id: number;
  question: {
    id: string;
    en: string;
  };
  options: {
    id: string[];
    en: string[];
  };
  correctIndex: number;
  explanation: {
    id: string;
    en: string;
  };
}

export interface TycoonUpgrade {
  id: string;
  name: { id: string; en: string };
  cost: number;
  cps: number; // coins per second
  owned: number;
  icon: string;
  description: { id: string; en: string };
}
