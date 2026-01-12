import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context, locale = 'ja' } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const prompt = locale === 'ja'
      ? `あなたはポーカーのGTOコーチです。初心者にわかりやすく教えてください。

## 現在のシチュエーション
- 状況: ${context.situationContext}
- ハンド: ${context.hand}
- 正解アクション: ${context.correctAction}
- ユーザーの選択: ${context.userAction}
- 結果: ${context.isCorrect ? '正解' : '不正解'}
${context.aiExplanation ? `\n## 先ほどのAI解説\n${context.aiExplanation}\n` : ''}
## ユーザーの質問
${message}

${context.aiExplanation ? '上記のAI解説を踏まえて、' : ''}簡潔に、でも初心者にもわかるように説明してください。必要に応じて具体例を使ってください。
回答は日本語で、200文字程度を目安にしてください。`
      : `You are a GTO poker coach. Explain in a beginner-friendly way.

## Current Situation
- Situation: ${context.situationContext}
- Hand: ${context.hand}
- Correct action: ${context.correctAction}
- User's choice: ${context.userAction}
- Result: ${context.isCorrect ? 'Correct' : 'Incorrect'}
${context.aiExplanation ? `\n## Previous AI Explanation\n${context.aiExplanation}\n` : ''}
## User's Question
${message}

${context.aiExplanation ? 'Based on the AI explanation above, ' : ''}explain concisely but in a way beginners can understand. Use examples when helpful.
Keep your response around 100-150 words in English.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
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
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
