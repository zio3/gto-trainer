import { Situation, Action, Position, AnswerLevel } from './types';
import { generateRandomHandWithSuits, OPEN_RANGES, VS_OPEN_RANGES, BORDERLINE_HANDS, OBVIOUS_HANDS } from './gto-ranges';

// シチュエーション生成
export const generateSituation = (): Situation => {
  const rand = Math.random();
  const handData = generateRandomHandWithSuits();

  if (rand < 0.6) {
    // オープンシチュエーション
    const positions: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB'];
    const position = positions[Math.floor(Math.random() * positions.length)];

    // ポジションに応じた説明文
    const descriptions: Record<string, string> = {
      UTG: 'UTG。最初のアクション。',
      HJ: 'HJ。UTGがフォールド。',
      CO: 'CO。UTG、HJがフォールド。',
      BTN: 'BTN。UTG〜COがフォールド。',
      SB: 'SB。全員フォールドで回ってきた。',
    };

    return {
      type: 'open',
      position,
      hand: handData.notation,
      handData,
      description: descriptions[position],
      options: ['Raise', 'Fold'] as Action[],
    };
  } else {
    // vs オープンシチュエーション
    const scenarios: { villain: Position; hero: Position; key: string }[] = [
      { villain: 'BTN', hero: 'BB', key: 'BB_vs_BTN' },
      { villain: 'CO', hero: 'BB', key: 'BB_vs_CO' },
      { villain: 'HJ', hero: 'BB', key: 'BB_vs_HJ' },
    ];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    return {
      type: 'vsOpen',
      position: scenario.hero,
      villainPosition: scenario.villain,
      rangeKey: scenario.key,
      hand: handData.notation,
      handData,
      description: `BB。${scenario.villain}が2.5bbオープン。`,
      options: ['3-Bet', 'Call', 'Fold'] as Action[],
    };
  }
};

// 正解判定
export const getCorrectAction = (situation: Situation): Action => {
  if (situation.type === 'open') {
    const range = OPEN_RANGES[situation.position];
    if (range?.raise.includes(situation.hand)) {
      return 'Raise';
    }
    return 'Fold';
  } else {
    const range = VS_OPEN_RANGES[situation.rangeKey];
    if (range?.threebet.includes(situation.hand)) {
      return '3-Bet';
    }
    if (range?.call.includes(situation.hand)) {
      return 'Call';
    }
    return 'Fold';
  }
};

// 回答レベルを判定
export const getAnswerLevel = (
  situation: Situation,
  userAction: Action,
  correctAction: Action
): AnswerLevel => {
  const hand = situation.hand;
  const isCorrect = userAction === correctAction;

  // 明らかに強いハンド
  const isObviouslyStrong = OBVIOUS_HANDS.strong.includes(hand);
  // 明らかに弱いハンド
  const isObviouslyWeak = OBVIOUS_HANDS.weak.includes(hand) ||
    OBVIOUS_HANDS.weak.includes(hand.replace('s', 'o'));

  // ボーダーラインハンドかどうか
  let isBorderline = false;
  if (situation.type === 'open') {
    const borderlineHands = BORDERLINE_HANDS.open[situation.position as keyof typeof BORDERLINE_HANDS.open];
    isBorderline = borderlineHands?.includes(hand) || false;
  } else {
    const borderlineData = BORDERLINE_HANDS.vsOpen[situation.rangeKey as keyof typeof BORDERLINE_HANDS.vsOpen];
    if (borderlineData) {
      isBorderline = borderlineData.threebet.includes(hand) || borderlineData.call.includes(hand);
    }
  }

  if (isCorrect) {
    // 正解の場合
    if (isObviouslyStrong && (correctAction === 'Raise' || correctAction === '3-Bet')) {
      return 'obvious';
    }
    if (isObviouslyWeak && correctAction === 'Fold') {
      return 'obvious';
    }
    if (isBorderline) {
      return 'borderline';
    }
    return 'correct';
  } else {
    // 不正解の場合
    // 明らかに強いハンドをフォールド
    if (isObviouslyStrong && userAction === 'Fold') {
      return 'critical_mistake';
    }
    // 明らかに弱いハンドをレイズ/3-bet
    if (isObviouslyWeak && (userAction === 'Raise' || userAction === '3-Bet')) {
      return 'critical_mistake';
    }
    // ボーダーラインなら許容
    if (isBorderline) {
      return 'borderline';
    }
    return 'wrong';
  }
};

// 解説生成
export const getExplanation = (situation: Situation, correctAction: Action): string => {
  const hand = situation.hand;

  let explanation = '';

  if (situation.type === 'open') {
    if (correctAction === 'Raise') {
      explanation = `${hand}は${situation.position}からのオープンレンジに含まれます。`;
      if (hand.includes('A') && hand.endsWith('s') && !hand.includes('K') && !hand.includes('Q')) {
        explanation += `\nスーテッドAは、フラッシュ・ストレートのポテンシャルとブロッカー効果があります。`;
      }
      if (hand.length === 2) {
        explanation += `\nポケットペアはセットマイニングの価値があります。`;
      }
    } else {
      explanation = `${hand}は${situation.position}からのオープンには弱いです。`;
      if (situation.position === 'UTG' || situation.position === 'HJ') {
        explanation += `\nアーリーポジションでは、よりタイトなレンジでプレイします。`;
      }
    }
  } else {
    if (correctAction === '3-Bet') {
      explanation = `${hand}はvs ${situation.villainPosition}で3-betできるハンドです。`;
      if (hand.includes('A') && hand.endsWith('s') && ['A5s', 'A4s', 'A3s'].includes(hand)) {
        explanation += `\n小さいスーテッドAはブラフ3-betとしても使えます（ブロッカー＋ナッツポテンシャル）。`;
      }
    } else if (correctAction === 'Call') {
      explanation = `${hand}はコールに適したハンドです。`;
      explanation += `\n3-betするには弱く、フォールドするにはもったいないレンジです。`;
    } else {
      explanation = `${hand}はここではフォールドが推奨されます。`;
      explanation += `\n期待値的にプレイを続けるのが難しいハンドです。`;
    }
  }

  return explanation;
};
