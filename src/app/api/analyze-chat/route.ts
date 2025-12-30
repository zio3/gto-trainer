import { NextRequest, NextResponse } from 'next/server';

interface HistoryEntry {
  situation: string;
  hand: string;
  correct: string;
  user: string;
  isCorrect: boolean;
  level: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, analysis, history, stats } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // 履歴の要約
    const historySummary = history.slice(-10).map((h: HistoryEntry, i: number) =>
      `${i + 1}. ${h.situation} | ${h.hand} | ${h.isCorrect ? '○' : '×'}`
    ).join('\n');

    const prompt = `あなたはポーカーのGTOコーチです。

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
回答は日本語で、200-300文字程度を目安にしてください。`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
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
    const text = data.content?.map((item: { text?: string }) => item.text || '').join('\n') || '回答を取得できませんでした';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Analyze chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
