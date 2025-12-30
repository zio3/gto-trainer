import { NextRequest, NextResponse } from 'next/server';

interface HistoryEntry {
  situation: string;
  hand: string;
  correct: string;
  user: string;
  isCorrect: boolean;
  level: 'critical_mistake' | 'wrong' | 'borderline' | 'correct' | 'obvious';
}

const levelLabels: Record<string, string> = {
  critical_mistake: '💀重大ミス',
  wrong: '×不正解',
  borderline: '🤔ボーダー',
  correct: '○正解',
  obvious: '👍完璧',
};

export async function POST(request: NextRequest) {
  try {
    const { history, stats } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const historyText = history.map((h: HistoryEntry, i: number) =>
      `${i + 1}. ${h.situation} | ハンド: ${h.hand} | 正解: ${h.correct} | 選択: ${h.user} | ${levelLabels[h.level] || h.level}`
    ).join('\n');

    // 統計情報を集計
    const criticalMistakes = history.filter((h: HistoryEntry) => h.level === 'critical_mistake').length;
    const borderlines = history.filter((h: HistoryEntry) => h.level === 'borderline').length;

    const prompt = `あなたはポーカーのGTOコーチです。以下は生徒のプリフロップ練習の結果です。

${historyText}

## 統計
- 正解率: ${stats.correct}/${stats.total} (${Math.round((stats.correct / stats.total) * 100)}%)
- 重大なミス（プレミアムハンドのフォールド等）: ${criticalMistakes}回
- ボーダーライン（どちらでもOK）: ${borderlines}回

この結果を分析して、以下の形式で日本語でフィードバックしてください：

## 総評
（全体的な傾向を2-3文で。重大なミスがあれば特に言及）

## 良かった点
（できていることを箇条書きで）

## 改善ポイント
（間違いの傾向から具体的なアドバイスを箇条書きで。重大なミスは特に強調）

## 次の10問で意識すること
（1つだけ、具体的に）`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
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
    const text = data.content?.map((item: { text?: string }) => item.text || '').join('\n') || '分析を取得できませんでした';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
