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

// vs オープンのアクション（簡易版GTO）
export const VS_OPEN_RANGES: Record<string, { threebet: string[]; call: string[] }> = {
  // === BB vs オープン ===
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
  'BB_vs_UTG': {
    threebet: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'A5s', 'AKo'],
    call: ['TT', '99', '88', '77', '66', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs', 'T9s', '98s', 'AQo', 'AJo', 'KQo'],
  },

  // === SB vs オープン（ほぼ3-bet or fold、コールは極少） ===
  'SB_vs_BTN': {
    threebet: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AQs', 'AJs', 'ATs', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s', '65s', '54s', 'AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo'],
    call: ['77', '66', 'A9s', 'A8s', 'A7s', 'A6s', 'K9s', 'Q9s', 'J9s', 'T8s', '97s', '86s', '75s', '64s'],
  },
  'SB_vs_CO': {
    threebet: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'A5s', 'A4s', 'A3s', 'KQs', 'KJs', 'QJs', 'AKo', 'AQo', 'AJo', 'KQo'],
    call: ['88', '77', '66', 'ATs', 'A9s', 'KTs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s'],
  },
  'SB_vs_HJ': {
    threebet: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AJs', 'A5s', 'A4s', 'KQs', 'AKo', 'AQo'],
    call: ['99', '88', '77', 'ATs', 'KJs', 'QJs', 'JTs', 'T9s'],
  },
  'SB_vs_UTG': {
    threebet: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AQs', 'A5s', 'AKo'],
    call: ['TT', '99', 'AJs', 'KQs'],
  },

  // === BTN vs オープン ===
  'BTN_vs_CO': {
    threebet: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'ATs', 'A5s', 'A4s', 'A3s', 'A2s', 'KQs', 'KJs', 'QJs', 'JTs', 'T9s', '98s', '87s', '76s', '65s', '54s', 'AKo', 'AQo', 'AJo', 'KQo'],
    call: ['88', '77', '66', '55', '44', '33', '22', 'A9s', 'A8s', 'A7s', 'A6s', 'KTs', 'K9s', 'K8s', 'QTs', 'Q9s', 'J9s', 'T8s', '97s', '86s', '75s', '64s', '53s', 'ATo', 'KJo', 'KTo', 'QJo', 'QTo', 'JTo'],
  },
  'BTN_vs_HJ': {
    threebet: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'AJs', 'A5s', 'A4s', 'A3s', 'KQs', 'KJs', 'QJs', 'AKo', 'AQo', 'AJo', 'KQo'],
    call: ['99', '88', '77', '66', '55', '44', '33', '22', 'ATs', 'A9s', 'A8s', 'A7s', 'KTs', 'K9s', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', 'T8s', '98s', '97s', '87s', '86s', '76s', '65s', '54s', 'ATo', 'KJo', 'KTo', 'QJo', 'JTo'],
  },
  'BTN_vs_UTG': {
    threebet: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'AQs', 'A5s', 'A4s', 'AKo', 'AQo'],
    call: ['TT', '99', '88', '77', '66', '55', '44', '33', '22', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s', '65s', 'AJo', 'KQo', 'KJo', 'QJo'],
  },

  // === CO vs オープン ===
  'CO_vs_HJ': {
    threebet: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AQs', 'A5s', 'A4s', 'AKo', 'AQo'],
    call: ['99', '88', '77', '66', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s', 'AJo', 'KQo', 'KJo', 'QJo'],
  },
  'CO_vs_UTG': {
    threebet: ['AA', 'KK', 'QQ', 'JJ', 'AKs', 'A5s', 'AKo'],
    call: ['TT', '99', '88', '77', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs', 'T9s', 'AQo', 'AJo', 'KQo'],
  },

  // === HJ vs オープン ===
  'HJ_vs_UTG': {
    threebet: ['AA', 'KK', 'QQ', 'AKs', 'AKo'],
    call: ['JJ', 'TT', '99', '88', '77', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs', 'AQo', 'KQo'],
  },
};

import { MixedStrategyData } from './types';

// ボーダーラインハンドのミックス戦略データ（AI推定値）
// 数値は各アクションの頻度（%）を表す
export const MIXED_STRATEGY: {
  open: Record<string, MixedStrategyData>;
  vsOpen: Record<string, MixedStrategyData>;
} = {
  open: {
    UTG: {
      '77': { raise: 55, fold: 45 },
      '66': { raise: 35, fold: 65 },
      'ATs': { raise: 70, fold: 30 },
      'A5s': { raise: 60, fold: 40 },
      'A4s': { raise: 45, fold: 55 },
      'KJs': { raise: 55, fold: 45 },
      'QJs': { raise: 40, fold: 60 },
      'JTs': { raise: 35, fold: 65 },
      'T9s': { raise: 25, fold: 75 },
      'AJo': { raise: 50, fold: 50 },
      'KQo': { raise: 45, fold: 55 },
    },
    HJ: {
      '66': { raise: 60, fold: 40 },
      '55': { raise: 45, fold: 55 },
      'A9s': { raise: 65, fold: 35 },
      'A5s': { raise: 70, fold: 30 },
      'A4s': { raise: 55, fold: 45 },
      'A3s': { raise: 40, fold: 60 },
      'KTs': { raise: 60, fold: 40 },
      'QTs': { raise: 50, fold: 50 },
      '98s': { raise: 45, fold: 55 },
      'ATo': { raise: 55, fold: 45 },
      'KJo': { raise: 50, fold: 50 },
    },
    CO: {
      '55': { raise: 70, fold: 30 },
      '44': { raise: 55, fold: 45 },
      'A8s': { raise: 75, fold: 25 },
      'A7s': { raise: 65, fold: 35 },
      'K9s': { raise: 60, fold: 40 },
      'Q9s': { raise: 50, fold: 50 },
      'J9s': { raise: 55, fold: 45 },
      'T8s': { raise: 50, fold: 50 },
      '87s': { raise: 60, fold: 40 },
      '76s': { raise: 55, fold: 45 },
      'A9o': { raise: 55, fold: 45 },
      'KTo': { raise: 50, fold: 50 },
      'QJo': { raise: 55, fold: 45 },
    },
    BTN: {
      '33': { raise: 70, fold: 30 },
      '22': { raise: 55, fold: 45 },
      'K6s': { raise: 60, fold: 40 },
      'K5s': { raise: 55, fold: 45 },
      'Q8s': { raise: 55, fold: 45 },
      'J8s': { raise: 50, fold: 50 },
      'T7s': { raise: 50, fold: 50 },
      '86s': { raise: 55, fold: 45 },
      '75s': { raise: 55, fold: 45 },
      '64s': { raise: 50, fold: 50 },
      '53s': { raise: 45, fold: 55 },
      'A7o': { raise: 60, fold: 40 },
      'A6o': { raise: 50, fold: 50 },
      'K8o': { raise: 45, fold: 55 },
      'Q9o': { raise: 55, fold: 45 },
      'J9o': { raise: 50, fold: 50 },
      'T9o': { raise: 55, fold: 45 },
    },
    SB: {
      'K4s': { raise: 55, fold: 45 },
      'K3s': { raise: 50, fold: 50 },
      'K2s': { raise: 45, fold: 55 },
      'Q7s': { raise: 50, fold: 50 },
      'Q6s': { raise: 45, fold: 55 },
      'J7s': { raise: 50, fold: 50 },
      'T7s': { raise: 55, fold: 45 },
      '96s': { raise: 50, fold: 50 },
      '85s': { raise: 50, fold: 50 },
      '74s': { raise: 45, fold: 55 },
      '63s': { raise: 40, fold: 60 },
      'K7o': { raise: 50, fold: 50 },
      'K6o': { raise: 45, fold: 55 },
      'Q9o': { raise: 55, fold: 45 },
      'J9o': { raise: 50, fold: 50 },
      'T9o': { raise: 55, fold: 45 },
      '87o': { raise: 50, fold: 50 },
    },
  },
  vsOpen: {
    'BB_vs_BTN': {
      'TT': { threebet: 55, call: 40, fold: 5 },
      'AJs': { threebet: 50, call: 45, fold: 5 },
      'A5s': { threebet: 65, call: 25, fold: 10 },
      'A4s': { threebet: 60, call: 25, fold: 15 },
      'A3s': { threebet: 55, call: 25, fold: 20 },
      'KQs': { threebet: 50, call: 45, fold: 5 },
      '76s': { threebet: 35, call: 50, fold: 15 },
      '65s': { threebet: 35, call: 45, fold: 20 },
      '54s': { threebet: 35, call: 40, fold: 25 },
      'A2s': { threebet: 20, call: 55, fold: 25 },
      'K2s': { threebet: 10, call: 50, fold: 40 },
      'Q5s': { threebet: 10, call: 50, fold: 40 },
      'J7s': { threebet: 10, call: 55, fold: 35 },
      'T7s': { threebet: 10, call: 55, fold: 35 },
      '97s': { threebet: 10, call: 55, fold: 35 },
      '86s': { threebet: 10, call: 55, fold: 35 },
      '75s': { threebet: 15, call: 55, fold: 30 },
      '64s': { threebet: 15, call: 50, fold: 35 },
      '53s': { threebet: 15, call: 45, fold: 40 },
      'K7o': { threebet: 10, call: 50, fold: 40 },
      'Q9o': { threebet: 10, call: 55, fold: 35 },
      'J9o': { threebet: 10, call: 55, fold: 35 },
      'T9o': { threebet: 10, call: 55, fold: 35 },
      '98o': { threebet: 5, call: 50, fold: 45 },
    },
    'BB_vs_CO': {
      'TT': { threebet: 60, call: 35, fold: 5 },
      'AJs': { threebet: 55, call: 40, fold: 5 },
      'A5s': { threebet: 60, call: 25, fold: 15 },
      'A4s': { threebet: 55, call: 25, fold: 20 },
      'KQs': { threebet: 55, call: 40, fold: 5 },
      '44': { threebet: 15, call: 55, fold: 30 },
      '33': { threebet: 10, call: 50, fold: 40 },
      '22': { threebet: 10, call: 45, fold: 45 },
      'A7s': { threebet: 20, call: 55, fold: 25 },
      'A6s': { threebet: 20, call: 50, fold: 30 },
      'K7s': { threebet: 15, call: 50, fold: 35 },
      'Q9s': { threebet: 15, call: 55, fold: 30 },
      'J9s': { threebet: 15, call: 55, fold: 30 },
      'T8s': { threebet: 15, call: 55, fold: 30 },
      '97s': { threebet: 10, call: 50, fold: 40 },
      '76s': { threebet: 20, call: 50, fold: 30 },
      '65s': { threebet: 20, call: 45, fold: 35 },
      'KTo': { threebet: 15, call: 50, fold: 35 },
      'QTo': { threebet: 10, call: 50, fold: 40 },
      'JTo': { threebet: 10, call: 50, fold: 40 },
    },
    'BB_vs_HJ': {
      'JJ': { threebet: 55, call: 40, fold: 5 },
      'TT': { threebet: 50, call: 45, fold: 5 },
      'AQs': { threebet: 60, call: 35, fold: 5 },
      'A5s': { threebet: 55, call: 25, fold: 20 },
      'A4s': { threebet: 50, call: 25, fold: 25 },
      '55': { threebet: 15, call: 55, fold: 30 },
      '44': { threebet: 10, call: 50, fold: 40 },
      'A9s': { threebet: 25, call: 50, fold: 25 },
      'A8s': { threebet: 20, call: 50, fold: 30 },
      'KTs': { threebet: 25, call: 55, fold: 20 },
      'K9s': { threebet: 15, call: 50, fold: 35 },
      'QTs': { threebet: 20, call: 55, fold: 25 },
      'JTs': { threebet: 25, call: 55, fold: 20 },
      'T9s': { threebet: 20, call: 55, fold: 25 },
      '98s': { threebet: 15, call: 55, fold: 30 },
      '87s': { threebet: 15, call: 50, fold: 35 },
      '76s': { threebet: 15, call: 45, fold: 40 },
      'AJo': { threebet: 25, call: 50, fold: 25 },
      'KJo': { threebet: 15, call: 50, fold: 35 },
      'QJo': { threebet: 15, call: 50, fold: 35 },
    },
    'BB_vs_UTG': {
      'JJ': { threebet: 50, call: 45, fold: 5 },
      'A5s': { threebet: 45, call: 25, fold: 30 },
      '66': { threebet: 15, call: 55, fold: 30 },
      '55': { threebet: 10, call: 50, fold: 40 },
      'ATs': { threebet: 30, call: 55, fold: 15 },
      'KJs': { threebet: 20, call: 55, fold: 25 },
      'QJs': { threebet: 15, call: 55, fold: 30 },
      'T9s': { threebet: 15, call: 50, fold: 35 },
      '98s': { threebet: 10, call: 50, fold: 40 },
      'AJo': { threebet: 20, call: 50, fold: 30 },
      'KJo': { threebet: 10, call: 45, fold: 45 },
    },
    'SB_vs_BTN': {
      '88': { threebet: 55, call: 35, fold: 10 },
      'ATs': { threebet: 60, call: 35, fold: 5 },
      'A3s': { threebet: 55, call: 25, fold: 20 },
      'A2s': { threebet: 50, call: 25, fold: 25 },
      'KTs': { threebet: 55, call: 35, fold: 10 },
      'QTs': { threebet: 50, call: 35, fold: 15 },
      '98s': { threebet: 45, call: 35, fold: 20 },
      '87s': { threebet: 45, call: 35, fold: 20 },
      '76s': { threebet: 45, call: 30, fold: 25 },
      '65s': { threebet: 40, call: 30, fold: 30 },
      '54s': { threebet: 40, call: 25, fold: 35 },
      'ATo': { threebet: 50, call: 35, fold: 15 },
      'KJo': { threebet: 50, call: 35, fold: 15 },
      '77': { threebet: 30, call: 50, fold: 20 },
      '66': { threebet: 25, call: 45, fold: 30 },
      'A9s': { threebet: 35, call: 50, fold: 15 },
      'A8s': { threebet: 30, call: 50, fold: 20 },
      'A7s': { threebet: 25, call: 50, fold: 25 },
      'A6s': { threebet: 25, call: 45, fold: 30 },
      'K9s': { threebet: 30, call: 50, fold: 20 },
      'Q9s': { threebet: 25, call: 50, fold: 25 },
      'J9s': { threebet: 25, call: 50, fold: 25 },
    },
    'SB_vs_CO': {
      '99': { threebet: 60, call: 35, fold: 5 },
      'AJs': { threebet: 60, call: 35, fold: 5 },
      'A5s': { threebet: 55, call: 25, fold: 20 },
      'A4s': { threebet: 50, call: 25, fold: 25 },
      'A3s': { threebet: 45, call: 25, fold: 30 },
      'KJs': { threebet: 55, call: 35, fold: 10 },
      'QJs': { threebet: 50, call: 35, fold: 15 },
      'AJo': { threebet: 50, call: 35, fold: 15 },
      '88': { threebet: 35, call: 50, fold: 15 },
      '77': { threebet: 25, call: 50, fold: 25 },
      '66': { threebet: 20, call: 45, fold: 35 },
      'ATs': { threebet: 40, call: 50, fold: 10 },
      'A9s': { threebet: 30, call: 50, fold: 20 },
      'KTs': { threebet: 35, call: 50, fold: 15 },
      'QTs': { threebet: 30, call: 50, fold: 20 },
      'JTs': { threebet: 35, call: 50, fold: 15 },
      'T9s': { threebet: 30, call: 50, fold: 20 },
      '98s': { threebet: 25, call: 45, fold: 30 },
      '87s': { threebet: 25, call: 45, fold: 30 },
      '76s': { threebet: 25, call: 40, fold: 35 },
    },
    'SB_vs_HJ': {
      'TT': { threebet: 60, call: 35, fold: 5 },
      'AJs': { threebet: 55, call: 40, fold: 5 },
      'A5s': { threebet: 50, call: 25, fold: 25 },
      'A4s': { threebet: 45, call: 25, fold: 30 },
      'KQs': { threebet: 55, call: 40, fold: 5 },
      '99': { threebet: 35, call: 50, fold: 15 },
      '88': { threebet: 25, call: 50, fold: 25 },
      '77': { threebet: 20, call: 45, fold: 35 },
      'ATs': { threebet: 35, call: 55, fold: 10 },
      'KJs': { threebet: 35, call: 50, fold: 15 },
      'QJs': { threebet: 30, call: 50, fold: 20 },
      'JTs': { threebet: 30, call: 50, fold: 20 },
      'T9s': { threebet: 25, call: 50, fold: 25 },
    },
    'SB_vs_UTG': {
      'JJ': { threebet: 55, call: 40, fold: 5 },
      'AQs': { threebet: 60, call: 35, fold: 5 },
      'A5s': { threebet: 45, call: 25, fold: 30 },
      'TT': { threebet: 35, call: 55, fold: 10 },
      '99': { threebet: 25, call: 50, fold: 25 },
      'AJs': { threebet: 35, call: 55, fold: 10 },
      'KQs': { threebet: 30, call: 55, fold: 15 },
    },
    'BTN_vs_CO': {
      '99': { threebet: 55, call: 40, fold: 5 },
      'ATs': { threebet: 55, call: 40, fold: 5 },
      'A5s': { threebet: 60, call: 25, fold: 15 },
      'A4s': { threebet: 55, call: 25, fold: 20 },
      'A3s': { threebet: 50, call: 25, fold: 25 },
      'A2s': { threebet: 45, call: 25, fold: 30 },
      'KJs': { threebet: 55, call: 40, fold: 5 },
      'QJs': { threebet: 50, call: 40, fold: 10 },
      'JTs': { threebet: 50, call: 40, fold: 10 },
      'T9s': { threebet: 45, call: 40, fold: 15 },
      '98s': { threebet: 40, call: 40, fold: 20 },
      '87s': { threebet: 40, call: 35, fold: 25 },
      '76s': { threebet: 40, call: 35, fold: 25 },
      '65s': { threebet: 35, call: 35, fold: 30 },
      '54s': { threebet: 35, call: 30, fold: 35 },
      '88': { threebet: 30, call: 55, fold: 15 },
      '77': { threebet: 25, call: 55, fold: 20 },
      '66': { threebet: 20, call: 50, fold: 30 },
      'A9s': { threebet: 35, call: 50, fold: 15 },
      'A8s': { threebet: 30, call: 50, fold: 20 },
      'A7s': { threebet: 25, call: 50, fold: 25 },
      'A6s': { threebet: 25, call: 45, fold: 30 },
      'KTs': { threebet: 35, call: 55, fold: 10 },
      'K9s': { threebet: 25, call: 50, fold: 25 },
      'K8s': { threebet: 20, call: 45, fold: 35 },
      'QTs': { threebet: 30, call: 55, fold: 15 },
      'Q9s': { threebet: 20, call: 50, fold: 30 },
      'J9s': { threebet: 20, call: 55, fold: 25 },
      'T8s': { threebet: 20, call: 50, fold: 30 },
      'ATo': { threebet: 30, call: 50, fold: 20 },
      'KJo': { threebet: 30, call: 50, fold: 20 },
    },
    'BTN_vs_HJ': {
      'TT': { threebet: 55, call: 40, fold: 5 },
      'AJs': { threebet: 55, call: 40, fold: 5 },
      'A5s': { threebet: 55, call: 25, fold: 20 },
      'A4s': { threebet: 50, call: 25, fold: 25 },
      'A3s': { threebet: 45, call: 25, fold: 30 },
      'KJs': { threebet: 50, call: 45, fold: 5 },
      'QJs': { threebet: 45, call: 45, fold: 10 },
      '99': { threebet: 30, call: 55, fold: 15 },
      '88': { threebet: 25, call: 55, fold: 20 },
      '77': { threebet: 20, call: 50, fold: 30 },
      'ATs': { threebet: 35, call: 55, fold: 10 },
      'A9s': { threebet: 25, call: 55, fold: 20 },
      'A8s': { threebet: 20, call: 50, fold: 30 },
      'A7s': { threebet: 20, call: 45, fold: 35 },
      'KTs': { threebet: 30, call: 55, fold: 15 },
      'K9s': { threebet: 20, call: 50, fold: 30 },
      'QTs': { threebet: 25, call: 55, fold: 20 },
      'Q9s': { threebet: 15, call: 50, fold: 35 },
      'JTs': { threebet: 30, call: 55, fold: 15 },
      'J9s': { threebet: 15, call: 55, fold: 30 },
      'T9s': { threebet: 20, call: 55, fold: 25 },
      'ATo': { threebet: 25, call: 50, fold: 25 },
      'KJo': { threebet: 25, call: 50, fold: 25 },
    },
    'BTN_vs_UTG': {
      'JJ': { threebet: 50, call: 45, fold: 5 },
      'AQs': { threebet: 55, call: 40, fold: 5 },
      'A5s': { threebet: 50, call: 25, fold: 25 },
      'A4s': { threebet: 45, call: 25, fold: 30 },
      'TT': { threebet: 30, call: 60, fold: 10 },
      '99': { threebet: 20, call: 55, fold: 25 },
      '88': { threebet: 15, call: 50, fold: 35 },
      'AJs': { threebet: 30, call: 60, fold: 10 },
      'ATs': { threebet: 25, call: 55, fold: 20 },
      'KQs': { threebet: 30, call: 60, fold: 10 },
      'KJs': { threebet: 25, call: 55, fold: 20 },
      'QJs': { threebet: 20, call: 55, fold: 25 },
      'JTs': { threebet: 20, call: 55, fold: 25 },
      'T9s': { threebet: 15, call: 50, fold: 35 },
      '98s': { threebet: 15, call: 45, fold: 40 },
      'AJo': { threebet: 20, call: 50, fold: 30 },
      'KQo': { threebet: 20, call: 55, fold: 25 },
    },
    'CO_vs_HJ': {
      'TT': { threebet: 55, call: 40, fold: 5 },
      'AQs': { threebet: 55, call: 40, fold: 5 },
      'A5s': { threebet: 50, call: 25, fold: 25 },
      'A4s': { threebet: 45, call: 25, fold: 30 },
      '99': { threebet: 30, call: 55, fold: 15 },
      '88': { threebet: 25, call: 55, fold: 20 },
      '77': { threebet: 20, call: 50, fold: 30 },
      'AJs': { threebet: 35, call: 55, fold: 10 },
      'ATs': { threebet: 30, call: 55, fold: 15 },
      'A9s': { threebet: 20, call: 50, fold: 30 },
      'KJs': { threebet: 30, call: 55, fold: 15 },
      'KTs': { threebet: 25, call: 55, fold: 20 },
      'QJs': { threebet: 25, call: 55, fold: 20 },
      'QTs': { threebet: 20, call: 55, fold: 25 },
      'JTs': { threebet: 25, call: 55, fold: 20 },
      'T9s': { threebet: 20, call: 55, fold: 25 },
      '98s': { threebet: 15, call: 50, fold: 35 },
      '87s': { threebet: 15, call: 45, fold: 40 },
      '76s': { threebet: 15, call: 45, fold: 40 },
      'AJo': { threebet: 25, call: 50, fold: 25 },
      'KJo': { threebet: 20, call: 50, fold: 30 },
    },
    'CO_vs_UTG': {
      'JJ': { threebet: 50, call: 45, fold: 5 },
      'AKs': { threebet: 65, call: 30, fold: 5 },
      'A5s': { threebet: 45, call: 25, fold: 30 },
      'TT': { threebet: 30, call: 60, fold: 10 },
      '99': { threebet: 20, call: 55, fold: 25 },
      '88': { threebet: 15, call: 50, fold: 35 },
      '77': { threebet: 10, call: 45, fold: 45 },
      'AQs': { threebet: 35, call: 55, fold: 10 },
      'AJs': { threebet: 25, call: 55, fold: 20 },
      'ATs': { threebet: 20, call: 55, fold: 25 },
      'KQs': { threebet: 30, call: 55, fold: 15 },
      'KJs': { threebet: 20, call: 55, fold: 25 },
      'QJs': { threebet: 15, call: 55, fold: 30 },
      'JTs': { threebet: 15, call: 55, fold: 30 },
      'AQo': { threebet: 25, call: 50, fold: 25 },
      'AJo': { threebet: 15, call: 50, fold: 35 },
      'KQo': { threebet: 20, call: 55, fold: 25 },
    },
    'HJ_vs_UTG': {
      'QQ': { threebet: 65, call: 30, fold: 5 },
      'AKs': { threebet: 60, call: 35, fold: 5 },
      'JJ': { threebet: 35, call: 55, fold: 10 },
      'TT': { threebet: 25, call: 55, fold: 20 },
      '99': { threebet: 15, call: 50, fold: 35 },
      '88': { threebet: 10, call: 45, fold: 45 },
      '77': { threebet: 10, call: 40, fold: 50 },
      'AQs': { threebet: 35, call: 55, fold: 10 },
      'AJs': { threebet: 20, call: 55, fold: 25 },
      'ATs': { threebet: 15, call: 55, fold: 30 },
      'KQs': { threebet: 25, call: 55, fold: 20 },
      'KJs': { threebet: 15, call: 50, fold: 35 },
      'QJs': { threebet: 15, call: 50, fold: 35 },
      'JTs': { threebet: 15, call: 50, fold: 35 },
      'AQo': { threebet: 20, call: 50, fold: 30 },
      'KQo': { threebet: 15, call: 50, fold: 35 },
    },
  },
};

// ボーダーラインハンドのリスト（後方互換性のため残す）
export const BORDERLINE_HANDS = {
  open: {
    UTG: Object.keys(MIXED_STRATEGY.open.UTG),
    HJ: Object.keys(MIXED_STRATEGY.open.HJ),
    CO: Object.keys(MIXED_STRATEGY.open.CO),
    BTN: Object.keys(MIXED_STRATEGY.open.BTN),
    SB: Object.keys(MIXED_STRATEGY.open.SB),
  },
  vsOpen: Object.fromEntries(
    Object.entries(MIXED_STRATEGY.vsOpen).map(([key, hands]) => {
      const threebet = Object.entries(hands)
        .filter(([, freq]) => (freq.threebet || 0) >= 40)
        .map(([hand]) => hand);
      const call = Object.entries(hands)
        .filter(([, freq]) => (freq.call || 0) >= 40 && (freq.threebet || 0) < 40)
        .map(([hand]) => hand);
      return [key, { threebet, call }];
    })
  ),
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

// 正解率に応じたボーダーラインハンドの出現率を計算
const getBorderlineRate = (accuracy: number): number => {
  // 正解率が低い時は簡単な問題も出す、高い時はボーダー中心
  // 0% → 30%, 50% → 50%, 70% → 70%, 90%+ → 85%
  if (accuracy < 50) {
    return 0.3 + (accuracy / 50) * 0.2; // 30% ~ 50%
  } else if (accuracy < 70) {
    return 0.5 + ((accuracy - 50) / 20) * 0.2; // 50% ~ 70%
  } else {
    return Math.min(0.85, 0.7 + ((accuracy - 70) / 30) * 0.15); // 70% ~ 85%
  }
};

// ハンド生成（正解率に応じた難易度調整版）
export const generateRandomHandWithSuits = (accuracy: number = 50): HandData => {
  const borderlineRate = getBorderlineRate(accuracy);

  // 正解率に応じた確率でボーダーラインハンドから選ぶ
  if (Math.random() < borderlineRate) {
    const allBorderlineHands = [
      ...new Set([
        ...Object.values(BORDERLINE_HANDS.open).flat(),
        ...Object.values(BORDERLINE_HANDS.vsOpen).flatMap(v => [...v.threebet, ...v.call]),
      ])
    ];

    const notation = allBorderlineHands[Math.floor(Math.random() * allBorderlineHands.length)];
    return notationToHandData(notation);
  }

  // 残りは通常のランダム生成
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
