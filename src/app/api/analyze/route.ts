import { NextRequest } from 'next/server';

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
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const historyText = history.map((h: HistoryEntry, i: number) =>
      `${i + 1}. ${h.situation} | ハンド: ${h.hand} | 正解: ${h.correct} | 選択: ${h.user} | ${levelLabels[h.level] || h.level}`
    ).join('\n');

    const criticalMistakes = history.filter((h: HistoryEntry) => h.level === 'critical_mistake').length;
    const borderlines = history.filter((h: HistoryEntry) => h.level === 'borderline').length;

    const analyzedCount = history.length;

    const prompt = `あなたはポーカーのGTOコーチです。以下は生徒のプリフロップ練習の結果です。

${historyText}

## 統計
- 分析対象: ${analyzedCount}問
- 正解率: ${stats.correct}/${stats.total} (${Math.round((stats.correct / stats.total) * 100)}%)
- 重大なミス（プレミアムハンドのフォールド等）: ${criticalMistakes}回
- ボーダーライン（どちらでもOK）: ${borderlines}回

この結果を分析して、以下の形式で日本語でフィードバックしてください。最初に分析対象の問題数を明記してください。

## 分析結果（${analyzedCount}問）

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
        stream: true,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to get response from Claude API' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ストリーミングレスポンスを返す
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    controller.enqueue(encoder.encode(parsed.delta.text));
                  }
                } catch {
                  // JSON parse error, skip
                }
              }
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Analyze API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
