import { NextRequest } from 'next/server';

// APIルート共通の入力ガード（バリデーション + 簡易レート制限）

export const LIMITS = {
  message: 1000,        // ユーザー入力メッセージの最大文字数
  hand: 8,              // ハンド表記（例: "AKs"）
  situation: 200,       // シチュエーション説明文
  action: 20,           // アクション名
  analysis: 20000,      // 分析レポート全文
  aiExplanation: 5000,  // AI解説
  historyEntries: 100,  // 履歴の最大件数
  historyField: 100,    // 履歴エントリ内の各文字列
} as const;

export function isValidLocale(locale: unknown): locale is 'ja' | 'en' {
  return locale === 'ja' || locale === 'en';
}

export function isShortString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength;
}

interface HistoryEntryInput {
  situation: string;
  hand: string;
  correct: string;
  user: string;
  isCorrect: boolean;
  level: string;
  score?: number;
}

// 履歴配列を検証して安全な形に正規化。不正なら null
export function sanitizeHistory(history: unknown): HistoryEntryInput[] | null {
  if (!Array.isArray(history) || history.length === 0 || history.length > LIMITS.historyEntries) {
    return null;
  }
  const result: HistoryEntryInput[] = [];
  for (const entry of history) {
    if (typeof entry !== 'object' || entry === null) return null;
    const e = entry as Record<string, unknown>;
    if (
      !isShortString(e.situation, LIMITS.historyField) ||
      !isShortString(e.hand, LIMITS.hand) ||
      !isShortString(e.correct, LIMITS.action) ||
      !isShortString(e.user, LIMITS.action) ||
      typeof e.isCorrect !== 'boolean' ||
      !isShortString(e.level, LIMITS.action)
    ) {
      return null;
    }
    result.push({
      situation: e.situation,
      hand: e.hand,
      correct: e.correct,
      user: e.user,
      isCorrect: e.isCorrect,
      level: e.level,
      score: typeof e.score === 'number' ? e.score : 0,
    });
  }
  return result;
}

// --- 簡易レート制限（インメモリ・スライディングウィンドウ） ---
// サーバーレスではインスタンスごとに独立するため厳密ではないが、
// カジュアルな濫用（スクリプトでの連打・プロキシ利用）への抑止として機能する。

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

const requestLog = new Map<string, number[]>();

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  // 定期的に古いエントリを掃除（メモリ肥大防止）
  if (requestLog.size > 10_000) {
    for (const [key, times] of requestLog) {
      if (times[times.length - 1] < cutoff) requestLog.delete(key);
    }
  }

  const times = (requestLog.get(ip) ?? []).filter(t => t > cutoff);
  if (times.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(ip, times);
    return true;
  }
  times.push(now);
  requestLog.set(ip, times);
  return false;
}

// 400/429 レスポンスのショートハンド
export function badRequest(message = 'Invalid request') {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function tooManyRequests() {
  return new Response(JSON.stringify({ error: 'Too many requests. Please wait a moment.' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json' },
  });
}
