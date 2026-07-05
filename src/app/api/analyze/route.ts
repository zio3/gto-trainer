import { NextRequest } from 'next/server';
import { isValidLocale, sanitizeHistory, getClientIp, isRateLimited, badRequest, tooManyRequests } from '@/lib/api-guard';

interface HistoryEntry {
  situation: string;
  hand: string;
  correct: string;
  user: string;
  isCorrect: boolean;
  level: string;
  score?: number;
}

const levelLabelsJa: Record<string, string> = {
  critical_mistake: '💀重大ミス',
  wrong: '×不正解',
  borderline: '🤔ボーダー',
  correct: '○正解',
  obvious: '👍完璧',
};

const levelLabelsEn: Record<string, string> = {
  critical_mistake: '💀Critical',
  wrong: '×Wrong',
  borderline: '🤔Borderline',
  correct: '○Correct',
  obvious: '👍Perfect',
};

const scoreWeights: Record<string, number> = {
  obvious: 0.5,
  correct: 1.0,
  borderline: 1.0,
  wrong: 1.0,
  critical_mistake: 1.0,
};

export async function POST(request: NextRequest) {
  try {
    if (isRateLimited(getClientIp(request))) return tooManyRequests();

    const { history: rawHistory, stats, locale = 'ja' } = await request.json();

    const history = sanitizeHistory(rawHistory);
    if (
      !isValidLocale(locale) ||
      !history ||
      typeof stats !== 'object' || stats === null ||
      typeof stats.correct !== 'number' ||
      typeof stats.total !== 'number' ||
      stats.total <= 0
    ) {
      return badRequest();
    }

    const levelLabels = locale === 'ja' ? levelLabelsJa : levelLabelsEn;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const historyText = history.map((h: HistoryEntry, i: number) => {
      if (locale === 'ja') {
        return `${i + 1}. ${h.situation} | ハンド: ${h.hand} | 正解: ${h.correct} | 選択: ${h.user} | ${levelLabels[h.level] || h.level} | スコア: ${h.score ?? 0}`;
      }
      return `${i + 1}. ${h.situation} | Hand: ${h.hand} | Correct: ${h.correct} | Choice: ${h.user} | ${levelLabels[h.level] || h.level} | Score: ${h.score ?? 0}`;
    }).join('\n');

    const criticalMistakes = history.filter((h: HistoryEntry) => h.level === 'critical_mistake').length;
    const borderlines = history.filter((h: HistoryEntry) => h.level === 'borderline').length;
    const obviousCorrects = history.filter((h: HistoryEntry) => h.level === 'obvious').length;
    const normalCorrects = history.filter((h: HistoryEntry) => h.level === 'correct').length;

    // 重み付きスコア計算
    const totalScore = history.reduce((sum: number, h: HistoryEntry) => sum + (h.score ?? 0), 0);
    const maxScore = history.reduce((sum: number, h: HistoryEntry) => sum + (scoreWeights[h.level] ?? 1.0), 0);
    const weightedPercentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    const analyzedCount = history.length;

    const prompt = locale === 'ja'
      ? `あなたはポーカーのGTOコーチです。以下は生徒のプリフロップ練習の結果です。

${historyText}

## 統計
- 分析対象: ${analyzedCount}問
- 正解率: ${stats.correct}/${stats.total} (${Math.round((stats.correct / stats.total) * 100)}%)
- 重み付きスコア: ${totalScore.toFixed(1)}/${maxScore.toFixed(1)} (${weightedPercentage}%)
- 簡単な問題の正解: ${obviousCorrects}回（スコア×0.5）
- 通常の正解: ${normalCorrects}回（スコア×1.0）
- ボーダーライン: ${borderlines}回（どちらでもスコア×1.0）
- 重大なミス: ${criticalMistakes}回（スコア-0.5のペナルティ）

## スコアの考え方
- 簡単な問題（AAレイズ等）の正解は価値が低い（0.5点）
- ボーダーラインの判断は難しいので両方正解（1点）
- 通常の正解は1点
- 重大なミスは-0.5点のペナルティ
- 重み付きスコアが高いほど「難しい問題も正解できている」ことを意味する

この結果を分析して、以下の形式で日本語でフィードバックしてください。
単純な正解率だけでなく、重み付きスコアも考慮して評価してください。

## 分析結果（${analyzedCount}問）

## 総評
（全体的な傾向を2-3文で。正解率と重み付きスコアの差があれば言及。重大なミスがあれば特に言及）

## 良かった点
（できていることを箇条書きで。難しい問題を正解していれば特に評価）

## 改善ポイント
（間違いの傾向から具体的なアドバイスを箇条書きで。重大なミスは特に強調）

## 次の10問で意識すること
（1つだけ、具体的に）`
      : `You are a GTO poker coach. Below are a student's preflop practice results.

${historyText}

## Statistics
- Questions analyzed: ${analyzedCount}
- Accuracy: ${stats.correct}/${stats.total} (${Math.round((stats.correct / stats.total) * 100)}%)
- Weighted score: ${totalScore.toFixed(1)}/${maxScore.toFixed(1)} (${weightedPercentage}%)
- Easy questions correct: ${obviousCorrects} (×0.5 score)
- Normal correct: ${normalCorrects} (×1.0 score)
- Borderline: ${borderlines} (×1.0 score for either choice)
- Critical mistakes: ${criticalMistakes} (-0.5 penalty)

## Scoring System
- Easy questions (like raising AA) are worth less (0.5 points)
- Borderline decisions are difficult, so both answers score full points (1 point)
- Normal correct answers are 1 point
- Critical mistakes incur -0.5 penalty
- Higher weighted score means "correctly answering difficult questions"

Analyze these results and provide feedback in the following format.
Consider both simple accuracy and weighted score in your evaluation.

## Analysis Results (${analyzedCount} questions)

## Overall Assessment
(2-3 sentences on general trends. Mention if accuracy and weighted score differ. Note any critical mistakes.)

## Strengths
(Bullet points of what's working well. Especially praise correct answers on difficult questions.)

## Areas for Improvement
(Specific advice in bullet points based on mistake patterns. Emphasize critical mistakes.)

## Focus for Next 10 Questions
(Just one specific point to focus on)`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
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
