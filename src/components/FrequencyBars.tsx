'use client';

import { ActionFrequency } from '@/lib/types';
import { getFrequencyEntries } from '@/lib/game-logic';

interface FrequencyBarsProps {
  frequency: ActionFrequency;
  situationType: 'open' | 'vsOpen';
}

const BAR_COLORS: Record<string, string> = {
  'Raise': 'bg-red-500',
  '3-Bet': 'bg-red-500',
  'Call': 'bg-blue-500',
  'Fold': 'bg-gray-500',
};

// GTO混合戦略の頻度バー（回答後に伸びるアニメーション付き）
export default function FrequencyBars({ frequency, situationType }: FrequencyBarsProps) {
  const entries = getFrequencyEntries(frequency, situationType);

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => (
        <div key={entry.action}>
          <div className="flex justify-between text-xs font-mono tabular-nums mb-1">
            <span className="text-gray-300">{entry.action}</span>
            <span className="text-gray-400">{entry.percent}%</span>
          </div>
          <div className="h-1.5 rounded-sm bg-gray-900 overflow-hidden">
            <div
              className={`h-full rounded-sm freq-fill ${BAR_COLORS[entry.action] ?? 'bg-gray-500'}`}
              style={{ width: `${entry.percent}%`, animationDelay: `${i * 90}ms` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
