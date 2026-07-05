'use client';

import { SUITS } from '@/lib/gto-ranges';
import { Suit } from '@/lib/types';

interface CardProps {
  rank: string;
  suit: Suit;
}

export default function Card({ rank, suit }: CardProps) {
  const suitInfo = SUITS[suit];
  return (
    <div className="bg-[#f2f5fa] rounded-lg shadow-lg w-16 h-24 flex flex-col items-center justify-center border border-[#c9d3e4]">
      <span className={`text-2xl font-bold ${suitInfo.color === 'text-gray-800' ? 'text-gray-800' : suitInfo.color}`}>
        {rank}
      </span>
      <span className={`text-3xl ${suitInfo.color}`}>
        {suitInfo.symbol}
      </span>
    </div>
  );
}
