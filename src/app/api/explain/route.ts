import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { situation, hand, correctAction, userAction, isCorrect } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `あなたはポーカーのGTOコーチです。以下のプリフロップシチュエーションについて、初心者にもわかりやすく解説してください。

## シチュエーション
${situation}

## ハンド
${hand}

## 正解アクション
${correctAction}

## ユーザーの選択
${userAction} (${isCorrect ? '正解' : '不正解'})

以下の観点を含めて、150-200文字程度で簡潔に解説してください：
1. なぜこのアクションが正解なのか
2. このハンドの特徴（ブロッカー、ポテンシャル等）
3. ポジションの影響
${!isCorrect ? '4. ユーザーの選択がなぜ適切でないか' : ''}

日本語で回答してください。`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 400,
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
    const text = data.content?.map((item: { text?: string }) => item.text || '').join('\n') || '解説を取得できませんでした';

    return NextResponse.json({ text });
  } catch (error) {
    console.error('Explain API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
