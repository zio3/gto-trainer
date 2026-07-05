import { NextRequest, NextResponse } from 'next/server';
import { LIMITS, isValidLocale, isShortString, sanitizeHistory, getClientIp, isRateLimited, badRequest, tooManyRequests } from '@/lib/api-guard';

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(getClientIp(request))) return tooManyRequests();

    const { message, analysis, history: rawHistory, stats, locale = 'ja' } = await request.json();

    const history = sanitizeHistory(rawHistory);
    if (
      !isValidLocale(locale) ||
      !isShortString(message, LIMITS.message) ||
      !isShortString(analysis, LIMITS.analysis) ||
      !history ||
      typeof stats !== 'object' || stats === null ||
      typeof stats.correct !== 'number' ||
      typeof stats.total !== 'number'
    ) {
      return badRequest();
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // 履歴の要約
    const historySummary = history.slice(-10).map((h, i) =>
      `${i + 1}. ${h.situation} | ${h.hand} | ${h.isCorrect ? '○' : '×'}`
    ).join('\n');

    const prompt = locale === 'ja'
      ? `あなたはポーカーのGTOコーチです。

## 先ほどの分析レポート
${analysis}

## 直近の回答履歴
${historySummary}

## 統計
正解率: ${stats.correct}/${stats.total}

## ユーザーの質問
${message}

上記の分析レポートを踏まえて、ユーザーの質問に答えてください。
具体的で実践的なアドバイスを心がけてください。
回答は日本語で、200-300文字程度を目安にしてください。`
      : `You are a GTO poker coach.

## Previous Analysis Report
${analysis}

## Recent Answer History
${historySummary}

## Statistics
Accuracy: ${stats.correct}/${stats.total}

## User's Question
${message}

Answer the user's question based on the analysis report above.
Focus on specific, practical advice.
Keep your response around 100-200 words in English.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get response from Claude API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const fallbackText = locale === 'ja' ? '回答を取得できませんでした' : 'Could not get response';
    const text = data.content?.map((item: { text?: string }) => item.text || '').join('\n') || fallbackText;

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Analyze chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
