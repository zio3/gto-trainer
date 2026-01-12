import { Situation, Action, Position, AnswerLevel, ActionFrequency } from './types';
import { generateRandomHandWithSuits, OPEN_RANGES, VS_OPEN_RANGES, BORDERLINE_HANDS, OBVIOUS_HANDS, MIXED_STRATEGY } from './gto-ranges';

export type Locale = 'ja' | 'en';

// ポジションに応じた説明文（言語対応）
const getOpenDescriptions = (locale: Locale): Record<string, string> => {
  if (locale === 'ja') {
    return {
      UTG: 'UTG。最初のアクション。',
      HJ: 'HJ。UTGがフォールド。',
      CO: 'CO。UTG、HJがフォールド。',
      BTN: 'BTN。UTG〜COがフォールド。',
      SB: 'SB。全員フォールドで回ってきた。',
    };
  }
  return {
    UTG: 'UTG. First to act.',
    HJ: 'HJ. UTG folded.',
    CO: 'CO. UTG, HJ folded.',
    BTN: 'BTN. UTG-CO folded.',
    SB: 'SB. Folded to you.',
  };
};

// vsOpenシナリオの説明文（言語対応）
const getVsOpenDescription = (hero: Position, villain: Position, locale: Locale): string => {
  if (locale === 'ja') {
    return `${hero}。${villain}が2.5bbオープン。`;
  }
  return `${hero}. ${villain} opened 2.5bb.`;
};

// シチュエーション生成（正解率に応じた難易度調整）
export const generateSituation = (accuracy: number = 50, locale: Locale = 'ja'): Situation => {
  const rand = Math.random();
  const handData = generateRandomHandWithSuits(accuracy);

  if (rand < 0.6) {
    // オープンシチュエーション
    const positions: Position[] = ['UTG', 'HJ', 'CO', 'BTN', 'SB'];
    const position = positions[Math.floor(Math.random() * positions.length)];
    const descriptions = getOpenDescriptions(locale);

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
    const scenarios: { villain: Position; hero: Position; key: string }[] = [
      // BB vs
      { villain: 'BTN', hero: 'BB', key: 'BB_vs_BTN' },
      { villain: 'CO', hero: 'BB', key: 'BB_vs_CO' },
      { villain: 'HJ', hero: 'BB', key: 'BB_vs_HJ' },
      { villain: 'UTG', hero: 'BB', key: 'BB_vs_UTG' },
      // SB vs
      { villain: 'BTN', hero: 'SB', key: 'SB_vs_BTN' },
      { villain: 'CO', hero: 'SB', key: 'SB_vs_CO' },
      { villain: 'HJ', hero: 'SB', key: 'SB_vs_HJ' },
      { villain: 'UTG', hero: 'SB', key: 'SB_vs_UTG' },
      // BTN vs
      { villain: 'CO', hero: 'BTN', key: 'BTN_vs_CO' },
      { villain: 'HJ', hero: 'BTN', key: 'BTN_vs_HJ' },
      { villain: 'UTG', hero: 'BTN', key: 'BTN_vs_UTG' },
      // CO vs
      { villain: 'HJ', hero: 'CO', key: 'CO_vs_HJ' },
      { villain: 'UTG', hero: 'CO', key: 'CO_vs_UTG' },
      // HJ vs
      { villain: 'UTG', hero: 'HJ', key: 'HJ_vs_UTG' },
    ];
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    return {
      type: 'vsOpen',
      position: scenario.hero,
      villainPosition: scenario.villain,
      rangeKey: scenario.key,
      hand: handData.notation,
      handData,
      description: getVsOpenDescription(scenario.hero, scenario.villain, locale),
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
    // ボーダーラインの場合：頻度データの上位2アクションなら許容
    if (isBorderline) {
      const freq = getActionFrequency(situation);
      if (freq) {
        const top2Actions = getTop2Actions(freq, situation.type);
        if (top2Actions.includes(userAction)) {
          return 'borderline';
        }
      } else {
        // 頻度データがない場合は従来の隣接ロジック（フォールバック）
        const isAdjacentAction =
          (correctAction === '3-Bet' && userAction === 'Call') ||
          (correctAction === 'Call' && (userAction === '3-Bet' || userAction === 'Fold')) ||
          (correctAction === 'Fold' && userAction === 'Call') ||
          (correctAction === 'Raise' && userAction === 'Fold') ||
          (correctAction === 'Fold' && userAction === 'Raise');

        if (isAdjacentAction) {
          return 'borderline';
        }
      }
    }
    return 'wrong';
  }
};

// 解説生成（言語対応）
export const getExplanation = (situation: Situation, correctAction: Action, locale: Locale = 'ja'): string => {
  const hand = situation.hand;

  let explanation = '';

  if (locale === 'ja') {
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
  } else {
    // English
    if (situation.type === 'open') {
      if (correctAction === 'Raise') {
        explanation = `${hand} is included in the ${situation.position} opening range.`;
        if (hand.includes('A') && hand.endsWith('s') && !hand.includes('K') && !hand.includes('Q')) {
          explanation += `\nSuited aces have flush/straight potential and blocker effects.`;
        }
        if (hand.length === 2) {
          explanation += `\nPocket pairs have set mining value.`;
        }
      } else {
        explanation = `${hand} is too weak to open from ${situation.position}.`;
        if (situation.position === 'UTG' || situation.position === 'HJ') {
          explanation += `\nPlay a tighter range from early positions.`;
        }
      }
    } else {
      if (correctAction === '3-Bet') {
        explanation = `${hand} can 3-bet vs ${situation.villainPosition}.`;
        if (hand.includes('A') && hand.endsWith('s') && ['A5s', 'A4s', 'A3s'].includes(hand)) {
          explanation += `\nSmall suited aces work as bluff 3-bets (blocker + nuts potential).`;
        }
      } else if (correctAction === 'Call') {
        explanation = `${hand} is a good calling hand.`;
        explanation += `\nToo weak to 3-bet, too strong to fold.`;
      } else {
        explanation = `${hand} should fold here.`;
        explanation += `\nNegative expected value to continue.`;
      }
    }
  }

  return explanation;
};

// ハンドのアクション頻度を取得
export const getActionFrequency = (situation: Situation): ActionFrequency | null => {
  const hand = situation.hand;

  if (situation.type === 'open') {
    const positionData = MIXED_STRATEGY.open[situation.position];
    if (positionData && positionData[hand]) {
      return positionData[hand];
    }
  } else {
    const rangeData = MIXED_STRATEGY.vsOpen[situation.rangeKey];
    if (rangeData && rangeData[hand]) {
      return rangeData[hand];
    }
  }

  return null;
};

// 上位2つのアクションを取得（Action[]形式）
export const getTop2Actions = (frequency: ActionFrequency, situationType: 'open' | 'vsOpen'): Action[] => {
  const entries: { action: Action; percent: number }[] = [];

  if (situationType === 'open') {
    if (frequency.raise !== undefined) entries.push({ action: 'Raise', percent: frequency.raise });
    if (frequency.fold !== undefined) entries.push({ action: 'Fold', percent: frequency.fold });
  } else {
    if (frequency.threebet !== undefined) entries.push({ action: '3-Bet', percent: frequency.threebet });
    if (frequency.call !== undefined) entries.push({ action: 'Call', percent: frequency.call });
    if (frequency.fold !== undefined) entries.push({ action: 'Fold', percent: frequency.fold });
  }

  // 降順でソートして上位2つを取得
  entries.sort((a, b) => b.percent - a.percent);
  return entries.slice(0, 2).map(e => e.action);
};

// 上位2つのアクションをフォーマット（例: "Raise 60% / Fold 40%"）
export const formatTopActions = (frequency: ActionFrequency, situationType: 'open' | 'vsOpen'): string => {
  const entries: { action: string; percent: number }[] = [];

  if (situationType === 'open') {
    if (frequency.raise !== undefined) entries.push({ action: 'Raise', percent: frequency.raise });
    if (frequency.fold !== undefined) entries.push({ action: 'Fold', percent: frequency.fold });
  } else {
    if (frequency.threebet !== undefined) entries.push({ action: '3-Bet', percent: frequency.threebet });
    if (frequency.call !== undefined) entries.push({ action: 'Call', percent: frequency.call });
    if (frequency.fold !== undefined) entries.push({ action: 'Fold', percent: frequency.fold });
  }

  // 降順でソートして上位2つを取得
  entries.sort((a, b) => b.percent - a.percent);
  const top2 = entries.slice(0, 2);

  return top2.map(e => `${e.action} ${e.percent}%`).join(' / ');
};
