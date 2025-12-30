import { Position, Suit, SuitInfo, HandData } from './types';

// ポジション一覧
export const POSITIONS: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'];

// ランク
export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

// スート情報
export const SUITS: Record<Suit, SuitInfo> = {
  s: { symbol: '♠', color: 'text-gray-800', name: 'spades' },
  h: { symbol: '♥', color: 'text-red-500', name: 'hearts' },
  d: { symbol: '♦', color: 'text-blue-500', name: 'diamonds' },
  c: { symbol: '♣', color: 'text-green-600', name: 'clubs' },
};

// オープンレンジ（簡易版）
export const OPEN_RANGES: Record<string, { raise: string[] }> = {
  UTG: {
    raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AQs', 'AJs', 'ATs', 'A5s', 'A4s', 'KQs', 'KJs', 'QJs', 'JTs', 'T9s', 'AKo', 'AQo', 'AJo', 'KQo'],
  },
  HJ: {
    raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A5s', 'A4s', 'A3s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo'],
  },
  CO: {
    raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '87s', '76s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo'],
  },
  BTN: {
    raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'JTs', 'J9s', 'J8s', 'T9s', 'T8s', 'T7s', '98s', '97s', '87s', '86s', '76s', '75s', '65s', '64s', '54s', '53s', '43s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o', 'KQo', 'KJo', 'KTo', 'K9o', 'K8o', 'QJo', 'QTo', 'Q9o', 'JTo', 'J9o', 'T9o', '98o', '87o'],
  },
  SB: {
    raise: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'JTs', 'J9s', 'J8s', 'J7s', 'T9s', 'T8s', 'T7s', '98s', '97s', '96s', '87s', '86s', '76s', '75s', '65s', '64s', '54s', '53s', '43s', 'AKo', 'AQo', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o', 'KQo', 'KJo', 'KTo', 'K9o', 'K8o', 'K7o', 'QJo', 'QTo', 'Q9o', 'JTo', 'J9o', 'T9o', '98o', '87o', '76o'],
  },
};

// vs オープンのアクション
export const VS_OPEN_RANGES: Record<string, { threebet: string[]; call: string[] }> = {
  'BB_vs_BTN': {
    threebet: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AJs', 'A5s', 'A4s', 'A3s', 'KQs', 'AKo', 'AQo', '76s', '65s', '54s'],
    call: ['99', '88', '77', '66', '55', '44', '33', '22', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A2s', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'K6s', 'K5s', 'K4s', 'K3s', 'K2s', 'QJs', 'QTs', 'Q9s', 'Q8s', 'Q7s', 'Q6s', 'Q5s', 'JTs', 'J9s', 'J8s', 'J7s', 'T9s', 'T8s', 'T7s', '98s', '97s', '87s', '86s', '75s', '64s', '53s', '43s', 'AJo', 'ATo', 'A9o', 'A8o', 'A7o', 'A6o', 'A5o', 'A4o', 'A3o', 'A2o', 'KQo', 'KJo', 'KTo', 'K9o', 'K8o', 'K7o', 'QJo', 'QTo', 'Q9o', 'JTo', 'J9o', 'T9o', '98o'],
  },
  'BB_vs_CO': {
    threebet: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AJs', 'A5s', 'A4s', 'KQs', 'AKo', 'AQo'],
    call: ['99', '88', '77', '66', '55', '44', '33', '22', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A3s', 'A2s', 'KJs', 'KTs', 'K9s', 'K8s', 'K7s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '76s', '65s', '54s', 'AJo', 'ATo', 'KQo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo'],
  },
  'BB_vs_HJ': {
    threebet: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'A5s', 'A4s', 'AKo'],
    call: ['99', '88', '77', '66', '55', 'AJs', 'ATs', 'A9s', 'A8s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s', '65s', 'AQo', 'AJo', 'KQo', 'KJo', 'QJo'],
  },
};

// ボーダーラインハンド（学習効果が高いハンド）
export const BORDERLINE_HANDS = {
  open: {
    UTG: ['77', '66', 'ATs', 'A5s', 'A4s', 'KJs', 'QJs', 'JTs', 'T9s', 'AJo', 'KQo'],
    HJ: ['66', '55', 'A9s', 'A5s', 'A4s', 'A3s', 'KTs', 'QTs', '98s', 'ATo', 'KJo'],
    CO: ['55', '44', 'A8s', 'A7s', 'K9s', 'Q9s', 'J9s', 'T8s', '87s', '76s', 'A9o', 'KTo', 'QJo'],
    BTN: ['33', '22', 'K6s', 'K5s', 'Q8s', 'J8s', 'T7s', '86s', '75s', '64s', '53s', 'A7o', 'A6o', 'K8o', 'Q9o', 'J9o', 'T9o'],
    SB: ['K4s', 'K3s', 'K2s', 'Q7s', 'Q6s', 'J7s', 'T7s', '96s', '85s', '74s', '63s', 'K7o', 'K6o', 'Q9o', 'J9o', 'T9o', '87o'],
  },
  vsOpen: {
    'BB_vs_BTN': {
      threebet: ['TT', 'AJs', 'A5s', 'A4s', 'A3s', 'KQs', '76s', '65s', '54s'],
      call: ['A2s', 'K2s', 'Q5s', 'J7s', 'T7s', '97s', '86s', '75s', '64s', '53s', 'K7o', 'Q9o', 'J9o', 'T9o', '98o'],
    },
    'BB_vs_CO': {
      threebet: ['TT', 'AJs', 'A5s', 'A4s', 'KQs'],
      call: ['44', '33', '22', 'A7s', 'A6s', 'K7s', 'Q9s', 'J9s', 'T8s', '97s', '76s', '65s', 'KTo', 'QTo', 'JTo'],
    },
    'BB_vs_HJ': {
      threebet: ['JJ', 'TT', 'AQs', 'A5s', 'A4s'],
      call: ['55', '44', 'A9s', 'A8s', 'KTs', 'K9s', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s', 'AJo', 'KJo', 'QJo'],
    },
  },
};

// 明らかに強い/弱いハンド
export const OBVIOUS_HANDS = {
  strong: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AKo', 'AQs'],
  weak: ['72o', '73o', '82o', '83o', '84o', '92o', '93o', '94o', '32o', '42o', '43o', '52o', '62o', '63o'],
};

// 表記からハンドデータを生成
export const notationToHandData = (notation: string): HandData => {
  const suitKeys: Suit[] = ['s', 'h', 'd', 'c'];

  // ポケットペア
  if (notation.length === 2) {
    const suit1 = suitKeys[Math.floor(Math.random() * 4)];
    let suit2 = suitKeys[Math.floor(Math.random() * 4)];
    while (suit2 === suit1) {
      suit2 = suitKeys[Math.floor(Math.random() * 4)];
    }
    return {
      notation,
      card1: { rank: notation[0], suit: suit1 },
      card2: { rank: notation[1], suit: suit2 },
      type: 'pair',
    };
  }

  // スーテッド
  if (notation.endsWith('s')) {
    const suit = suitKeys[Math.floor(Math.random() * 4)];
    return {
      notation,
      card1: { rank: notation[0], suit },
      card2: { rank: notation[1], suit },
      type: 'suited',
    };
  }

  // オフスート
  const suit1 = suitKeys[Math.floor(Math.random() * 4)];
  let suit2 = suitKeys[Math.floor(Math.random() * 4)];
  while (suit2 === suit1) {
    suit2 = suitKeys[Math.floor(Math.random() * 4)];
  }
  return {
    notation,
    card1: { rank: notation[0], suit: suit1 },
    card2: { rank: notation[1], suit: suit2 },
    type: 'offsuit',
  };
};

// ハンド生成（ボーダーライン重視版）
export const generateRandomHandWithSuits = (): HandData => {
  // 70%の確率でボーダーラインハンドから選ぶ
  if (Math.random() < 0.7) {
    const allBorderlineHands = [
      ...new Set([
        ...Object.values(BORDERLINE_HANDS.open).flat(),
        ...Object.values(BORDERLINE_HANDS.vsOpen).flatMap(v => [...v.threebet, ...v.call]),
      ])
    ];

    const notation = allBorderlineHands[Math.floor(Math.random() * allBorderlineHands.length)];
    return notationToHandData(notation);
  }

  // 30%は通常のランダム生成
  let notation: string;
  let attempts = 0;
  do {
    const i = Math.floor(Math.random() * 13);
    const j = Math.floor(Math.random() * 13);

    if (i === j) {
      notation = RANKS[i] + RANKS[j];
    } else {
      const high = Math.min(i, j);
      const low = Math.max(i, j);
      notation = RANKS[high] + RANKS[low] + (Math.random() > 0.5 ? 's' : 'o');
    }
    attempts++;

    const isObvious = OBVIOUS_HANDS.strong.includes(notation) ||
                      OBVIOUS_HANDS.weak.includes(notation) ||
                      OBVIOUS_HANDS.weak.includes(notation.replace('s', 'o'));

    if (!isObvious || Math.random() < 0.5 || attempts >= 5) {
      break;
    }
  } while (true);

  return notationToHandData(notation);
};
