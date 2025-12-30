// 型定義

export type Position = 'UTG' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB';
export type Suit = 's' | 'h' | 'd' | 'c';
export type HandType = 'pair' | 'suited' | 'offsuit';
export type Action = 'Raise' | 'Fold' | '3-Bet' | 'Call';

export interface CardData {
  rank: string;
  suit: Suit;
}

export interface HandData {
  notation: string;
  card1: CardData;
  card2: CardData;
  type: HandType;
}

export interface SuitInfo {
  symbol: string;
  color: string;
  name: string;
}

export interface OpenSituation {
  type: 'open';
  position: Position;
  hand: string;
  handData: HandData;
  description: string;
  options: Action[];
}

export interface VsOpenSituation {
  type: 'vsOpen';
  position: Position;
  villainPosition: Position;
  rangeKey: string;
  hand: string;
  handData: HandData;
  description: string;
  options: Action[];
}

export type Situation = OpenSituation | VsOpenSituation;

// 回答の評価レベル
export type AnswerLevel =
  | 'critical_mistake'  // 明らかな間違い（AAフォールド等）
  | 'wrong'             // 通常の不正解
  | 'borderline'        // ボーダーライン（どちらでもOK）
  | 'correct'           // 通常の正解
  | 'obvious';          // 当然の正解（AAレイズ等）

export interface Result {
  userAction: Action;
  correctAction: Action;
  isCorrect: boolean;
  explanation: string;
  level: AnswerLevel;
}

export interface Stats {
  correct: number;
  total: number;
}

export interface AnswerHistoryEntry {
  situation: string;
  hand: string;
  correct: Action;
  user: Action;
  isCorrect: boolean;
  level: AnswerLevel;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}
