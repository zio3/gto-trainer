'use client';

import Card from './Card';
import { HandData } from '@/lib/types';

interface HandDisplayProps {
  handData: HandData | null;
}

export default function HandDisplay({ handData }: HandDisplayProps) {
  if (!handData) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2 justify-center">
        <Card rank={handData.card1.rank} suit={handData.card1.suit} />
        <Card rank={handData.card2.rank} suit={handData.card2.suit} />
      </div>
      <div className="text-sm text-gray-400">
        {handData.notation}
        {handData.type === 'suited' && ' (スーテッド)'}
        {handData.type === 'offsuit' && ' (オフスート)'}
        {handData.type === 'pair' && ' (ポケットペア)'}
      </div>
    </div>
  );
}
