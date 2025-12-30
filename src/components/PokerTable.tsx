'use client';

import { Position } from '@/lib/types';

interface PokerTableProps {
  heroPosition: Position;
  villainPosition: Position | null;
}

export default function PokerTable({ heroPosition, villainPosition }: PokerTableProps) {
  // 6-maxのポジション配置（時計回り）
  const positions = [
    { name: 'BTN', x: 50, y: 85, label: 'BTN' },
    { name: 'SB', x: 15, y: 70, label: 'SB' },
    { name: 'BB', x: 15, y: 30, label: 'BB' },
    { name: 'UTG', x: 50, y: 15, label: 'UTG' },
    { name: 'HJ', x: 85, y: 30, label: 'HJ' },
    { name: 'CO', x: 85, y: 70, label: 'CO' },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="relative w-full" style={{ paddingBottom: '50%' }}>
        {/* テーブル */}
        <div
          className="absolute inset-4 rounded-full bg-green-800 border-4 border-yellow-700"
          style={{
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
          }}
        />

        {/* DEALER ボタン表示 */}
        <div
          className="absolute text-xs text-gray-400"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          6-MAX
        </div>

        {/* ポジションマーカー */}
        {positions.map((pos) => {
          const isHero = pos.name === heroPosition;
          const isVillain = pos.name === villainPosition;

          let bgColor = 'bg-gray-600';
          let textColor = 'text-gray-300';
          let ring = '';

          if (isHero) {
            bgColor = 'bg-blue-600';
            textColor = 'text-white';
            ring = 'ring-2 ring-blue-400';
          } else if (isVillain) {
            bgColor = 'bg-red-600';
            textColor = 'text-white';
            ring = 'ring-2 ring-red-400';
          }

          return (
            <div
              key={pos.name}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${bgColor} ${textColor} ${ring} rounded-lg px-2 py-1 text-xs font-bold transition-all`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              {pos.label}
              {isHero && <span className="block text-[10px] opacity-75">YOU</span>}
              {isVillain && <span className="block text-[10px] opacity-75">OPEN</span>}
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span className="text-gray-400">あなた</span>
        </div>
        {villainPosition && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span className="text-gray-400">オープン</span>
          </div>
        )}
      </div>
    </div>
  );
}
