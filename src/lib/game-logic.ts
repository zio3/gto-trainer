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
    // vs オープンシチュエーション（全ポジション対応）
    const scenarios: { villain: Position; hero: Position; key: string; description: string }[] = [
      // BB vs
      { villain: 'BTN', hero: 'BB', key: 'BB_vs_BTN', description: 'BB。BTNが2.5bbオープン。' },
      { villain: 'CO', hero: 'BB', key: 'BB_vs_CO', description: 'BB。COが2.5bbオープン。' },
      { villain: 'HJ', hero: 'BB', key: 'BB_vs_HJ', description: 'BB。HJが2.5bbオープン。' },
      { villain: 'UTG', hero: 'BB', key: 'BB_vs_UTG', description: 'BB。UTGが2.5bbオープン。' },
      // SB vs
      { villain: 'BTN', hero: 'SB', key: 'SB_vs_BTN', description: 'SB。BTNが2.5bbオープン。' },
      { villain: 'CO', hero: 'SB', key: 'SB_vs_CO', description: 'SB。COが2.5bbオープン。' },
      { villain: 'HJ', hero: 'SB', key: 'SB_vs_HJ', description: 'SB。HJが2.5bbオープン。' },
      { villain: 'UTG', hero: 'SB', key: 'SB_vs_UTG', description: 'SB。UTGが2.5bbオープン。' },
      // BTN vs
      { villain: 'CO', hero: 'BTN', key: 'BTN_vs_CO', description: 'BTN。COが2.5bbオープン。' },
      { villain: 'HJ', hero: 'BTN', key: 'BTN_vs_HJ', description: 'BTN。HJが2.5bbオープン。' },
      { villain: 'UTG', hero: 'BTN', key: 'BTN_vs_UTG', description: 'BTN。UTGが2.5bbオープン。' },
      // CO vs
      { villain: 'HJ', hero: 'CO', key: 'CO_vs_HJ', description: 'CO。HJが2.5bbオープン。' },
      { villain: 'UTG', hero: 'CO', key: 'CO_vs_UTG', description: 'CO。UTGが2.5bbオープン。' },
      // HJ vs
      { villain: 'UTG', hero: 'HJ', key: 'HJ_vs_UTG', description: 'HJ。UTGが2.5bbオープン。' },
    ];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    return {
      type: 'vsOpen',
      position: scenario.hero,
      villainPosition: scenario.villain,
      rangeKey: scenario.key,
      hand: handData.notation,
      handData,
      description: scenario.description,
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
    // ボーダーラインの場合：隣接するアクションのみ許容
    // 3-Bet vs Fold は真逆なので不正解扱い
    if (isBorderline) {
      const isAdjacentAction =
        (correctAction === '3-Bet' && userAction === 'Call') ||
        (correctAction === 'Call' && (userAction === '3-Bet' || userAction === 'Fold')) ||
        (correctAction === 'Fold' && userAction === 'Call') ||
        // openの場合はRaise/Foldしかないので常に隣接
        (correctAction === 'Raise' && userAction === 'Fold') ||
        (correctAction === 'Fold' && userAction === 'Raise');

      if (isAdjacentAction) {
        return 'borderline';
      }
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
