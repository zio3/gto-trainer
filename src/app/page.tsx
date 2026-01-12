'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import HandDisplay from '@/components/HandDisplay';
import PokerTable from '@/components/PokerTable';
import { generateSituation, getCorrectAction, getExplanation, getAnswerLevel, getActionFrequency, formatTopActions } from '@/lib/game-logic';
import { Situation, Result, Stats, AnswerHistoryEntry, ChatMessage, Action, Position, SCORE_WEIGHTS } from '@/lib/types';
import { OPEN_RANGES, VS_OPEN_RANGES, RANKS } from '@/lib/gto-ranges';
import { useTranslation } from '@/lib/i18n';

export default function GTOTrainer() {
  const { t, locale } = useTranslation();
  const [situation, setSituation] = useState<Situation | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [stats, setStats] = useState<Stats>({ correct: 0, total: 0, weightedScore: 0, maxPossibleScore: 0 });
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [answerHistory, setAnswerHistory] = useState<AnswerHistoryEntry[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [analysisChatInput, setAnalysisChatInput] = useState('');
  const [analysisChatHistory, setAnalysisChatHistory] = useState<ChatMessage[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showRangeChart, setShowRangeChart] = useState(false);
  const [selectedRangeType, setSelectedRangeType] = useState<'open' | 'vsOpen'>('open');
  const [selectedPosition, setSelectedPosition] = useState<Position>('UTG');
  const [selectedOpener, setSelectedOpener] = useState<Position>('BTN');
  const [selectedHero, setSelectedHero] = useState<Position>('BB');
  const [isOnline, setIsOnline] = useState(true);

  const resultRef = useRef<HTMLDivElement>(null);
  const situationRef = useRef<HTMLDivElement>(null);

  // オンライン/オフライン状態を監視
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const startNewHand = useCallback(() => {
    // 正解率を計算して難易度調整
    const accuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 50;
    setSituation(generateSituation(accuracy, locale));
    setResult(null);
    setShowChat(false);
    setChatHistory([]);
    setAiExplanation(null);
    // 次のハンド開始時にシチュエーション部分へスクロール
    setTimeout(() => {
      situationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, [stats.correct, stats.total, locale]);

  // AI解説を取得
  const runAiExplanation = async () => {
    if (!situation || !result) return;

    setIsExplaining(true);

    const situationText = locale === 'ja'
      ? (situation.type === 'open'
          ? `${situation.position}からのオープン判断。フォールドで回ってきた。`
          : `${situation.position}で${situation.villainPosition}の2.5bbオープンに対する判断。`)
      : (situation.type === 'open'
          ? `Open decision from ${situation.position}. Folded to you.`
          : `${situation.position} facing ${situation.villainPosition}'s 2.5bb open.`);

    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          situation: situationText,
          hand: situation.hand,
          correctAction: result.correctAction,
          userAction: result.userAction,
          isCorrect: result.isCorrect,
          locale,
        }),
      });

      const data = await response.json();
      if (data.error) {
        setAiExplanation((locale === 'ja' ? '解説の取得に失敗しました: ' : 'Failed to get explanation: ') + data.error);
      } else {
        setAiExplanation(data.text);
      }
    } catch (error) {
      setAiExplanation((locale === 'ja' ? '解説の取得に失敗しました: ' : 'Failed to get explanation: ') + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsExplaining(false);
    }
  };

  // AI分析を実行（ストリーミング）
  const runAnalysis = async () => {
    if (answerHistory.length < 5) {
      alert(t('analysis.minimumRequired'));
      return;
    }

    setIsAnalyzing(true);
    setShowAnalysis(true);
    setAnalysis('');

    // 直近100問に制限
    const recentHistory = answerHistory.slice(-100);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: recentHistory,
          stats,
          locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAnalysis((locale === 'ja' ? '分析中にエラーが発生しました: ' : 'Analysis error: ') + (errorData.error || 'Unknown error'));
        setIsAnalyzing(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setAnalysis(locale === 'ja' ? 'ストリーミングに失敗しました' : 'Streaming failed');
        setIsAnalyzing(false);
        return;
      }

      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        text += decoder.decode(value, { stream: true });
        setAnalysis(text);
      }

      setIsAnalyzing(false);
    } catch (error) {
      setAnalysis((locale === 'ja' ? '分析中にエラーが発生しました: ' : 'Analysis error: ') + (error instanceof Error ? error.message : 'Unknown error'));
      setIsAnalyzing(false);
    }
  };

  // 分析に対する質問
  const handleAnalysisChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysisChatInput.trim() || !analysis) return;

    const userMessage = analysisChatInput.trim();
    setAnalysisChatInput('');

    setAnalysisChatHistory(prev => [
      ...prev,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: locale === 'ja' ? '考え中...' : 'Thinking...', isLoading: true },
    ]);

    try {
      const response = await fetch('/api/analyze-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          analysis,
          history: answerHistory,
          stats,
          locale,
        }),
      });

      const data = await response.json();
      const text = data.error ? (locale === 'ja' ? 'エラーが発生しました: ' : 'Error: ') + data.error : data.text;

      setAnalysisChatHistory(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: text },
      ]);
    } catch (error) {
      setAnalysisChatHistory(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: (locale === 'ja' ? 'エラーが発生しました: ' : 'Error: ') + (error instanceof Error ? error.message : 'Unknown error') },
      ]);
    }
  };

  const handleAction = (action: Action) => {
    if (!situation) return;

    const correctAction = getCorrectAction(situation);
    const explanation = getExplanation(situation, correctAction, locale);
    const level = getAnswerLevel(situation, action, correctAction);
    // ボーダーラインはどちらでも正解扱い
    const isCorrect = action === correctAction || level === 'borderline';

    setResult({
      userAction: action,
      correctAction,
      isCorrect,
      explanation,
      level,
    });

    // スコア計算
    const weights = SCORE_WEIGHTS[level];
    const score = isCorrect ? weights.correct : weights.wrong;

    // 履歴に追加
    const historyEntry: AnswerHistoryEntry = {
      situation: situation.type === 'open'
        ? `${situation.position}オープン`
        : `${situation.position} vs ${situation.villainPosition}`,
      hand: situation.hand,
      correct: correctAction,
      user: action,
      isCorrect,
      level,
      score,
    };
    setAnswerHistory(prev => [...prev, historyEntry]);

    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      weightedScore: prev.weightedScore + score,
      maxPossibleScore: prev.maxPossibleScore + weights.maxPossible,
    }));

    // 回答後に結果部分へスクロール
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleDeleteHistory = (index: number) => {
    const entry = answerHistory[index];
    if (!entry) return;

    // 統計を更新
    const weights = SCORE_WEIGHTS[entry.level];
    setStats(prev => ({
      correct: prev.correct - (entry.isCorrect ? 1 : 0),
      total: prev.total - 1,
      weightedScore: prev.weightedScore - entry.score,
      maxPossibleScore: prev.maxPossibleScore - weights.maxPossible,
    }));

    // 履歴から削除
    setAnswerHistory(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAllHistory = () => {
    if (!confirm(t('history.clearConfirm'))) return;
    setAnswerHistory([]);
    setStats({ correct: 0, total: 0, weightedScore: 0, maxPossibleScore: 0 });
    setAnalysis(null);
    setAnalysisChatHistory([]);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !situation || !result) return;

    const userMessage = chatInput.trim();
    setChatInput('');

    // ユーザーメッセージを先に追加
    setChatHistory(prev => [
      ...prev,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: locale === 'ja' ? '考え中...' : 'Thinking...', isLoading: true },
    ]);

    // コンテキスト情報を構築
    const situationContext = locale === 'ja'
      ? (situation.type === 'open'
          ? `${situation.position}からのオープン判断`
          : `${situation.position} vs ${situation.villainPosition}のオープンに対する判断`)
      : (situation.type === 'open'
          ? `Open decision from ${situation.position}`
          : `Decision vs ${situation.villainPosition}'s open from ${situation.position}`);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: {
            situationContext,
            hand: situation.hand,
            correctAction: result.correctAction,
            userAction: result.userAction,
            isCorrect: result.isCorrect,
            aiExplanation: aiExplanation || null,
          },
          locale,
        }),
      });

      const data = await response.json();
      const text = data.error ? (locale === 'ja' ? 'エラーが発生しました: ' : 'Error: ') + data.error : data.text;

      // ローディング状態を実際の回答で置き換え
      setChatHistory(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: text },
      ]);
    } catch (error) {
      setChatHistory(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: (locale === 'ja' ? 'エラーが発生しました: ' : 'Error: ') + (error instanceof Error ? error.message : 'Unknown error') },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-32">
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-2">{t('app.title')}</h1>
        <p className="text-gray-400 text-center text-sm mb-6">{t('app.subtitle')}</p>

        {/* Stats */}
        <div className="bg-gray-800 rounded-lg p-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">{t('stats.accuracy')}</span>
            <span className="text-xl font-bold">
              {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
              <span className="text-sm text-gray-400 ml-2">({stats.correct}/{stats.total})</span>
            </span>
          </div>
          {stats.total > 0 && (
            <div className="flex gap-2 mt-3">
              {isOnline ? (
                <button
                  onClick={runAnalysis}
                  disabled={stats.total < 5}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1 ${
                    stats.total >= 5
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>📊</span> {t('stats.aiAnalysis')}{stats.total < 5 && <span className="text-xs ml-1">({t('stats.aiAnalysisRemaining', { count: 5 - stats.total })})</span>}
                </button>
              ) : (
                <div className="flex-1 bg-gray-700 text-gray-500 py-2 px-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                  <span>📴</span> {t('stats.offline')}
                </div>
              )}
              <button
                onClick={() => setShowHistory(true)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
              >
                <span>📝</span> {t('stats.viewHistory')}
              </button>
            </div>
          )}
        </div>

        {/* Analysis Modal */}
        {showAnalysis && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">📊 {t('analysis.title')}</h2>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="prose prose-invert prose-sm max-w-none">
                {analysis ? (
                  analysis.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <h3 key={i} className="text-lg font-bold text-purple-400 mt-4 mb-2">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      return <p key={i} className="ml-4 my-1">• {line.replace(/^[-*] /, '')}</p>;
                    }
                    if (line.trim()) {
                      return <p key={i} className="my-2 text-gray-300">{line}</p>;
                    }
                    return null;
                  })
                ) : isAnalyzing ? (
                  <div className="flex flex-col items-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-gray-400">{t('analysis.analyzing')}</p>
                  </div>
                ) : null}
                {isAnalyzing && analysis && (
                  <div className="flex items-center gap-2 mt-4 text-purple-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                    <span className="text-sm">{t('analysis.generating')}</span>
                  </div>
                )}
              </div>

              {/* 分析に対するチャット */}
              {!isAnalyzing && analysis && (
                <div className="mt-6 border-t border-gray-700 pt-4">
                  <div className="text-gray-400 text-sm mb-3">{t('analysis.askAboutAnalysis')}</div>

                  {analysisChatHistory.length > 0 && (
                    <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                      {analysisChatHistory.map((msg, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg text-sm ${
                            msg.role === 'user'
                              ? 'bg-purple-900 ml-8'
                              : 'bg-gray-700 mr-8'
                          }`}
                        >
                          {msg.isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span className="text-gray-400">{t('ai.thinking')}</span>
                            </div>
                          ) : (
                            <p className="whitespace-pre-line">{msg.content}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleAnalysisChatSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={analysisChatInput}
                      onChange={(e) => setAnalysisChatInput(e.target.value)}
                      placeholder={t('analysis.placeholder')}
                      className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      {t('ai.send')}
                    </button>
                  </form>
                </div>
              )}

              <button
                onClick={() => {
                  setShowAnalysis(false);
                  setAnalysisChatHistory([]);
                }}
                className="w-full mt-6 bg-gray-600 hover:bg-gray-500 py-2 rounded-lg font-bold transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">📝 {t('history.title')}</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {answerHistory.length === 0 ? (
                <p className="text-gray-400 text-center py-8">{t('history.empty')}</p>
              ) : (
                <div className="space-y-2">
                  {/* 全クリアボタン */}
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={handleClearAllHistory}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                    >
                      🗑️ {t('history.clearAll')}
                    </button>
                  </div>
                  {answerHistory.map((entry, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg flex items-center justify-between ${
                        entry.level === 'critical_mistake' ? 'bg-red-950' :
                        entry.level === 'wrong' ? 'bg-red-900/50' :
                        entry.level === 'borderline' ? 'bg-yellow-900/50' :
                        'bg-green-900/50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">{index + 1}.</span>
                          <span className="font-mono">{entry.hand}</span>
                          <span className="text-gray-500">|</span>
                          <span className="text-gray-400 truncate">{entry.situation}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <span className={entry.isCorrect ? 'text-green-400' : 'text-red-400'}>
                            {entry.user}
                          </span>
                          {entry.user !== entry.correct && (
                            <>
                              <span className="text-gray-500">→</span>
                              <span className="text-green-400">{entry.correct}</span>
                            </>
                          )}
                          <span className="text-gray-500 ml-auto">
                            {entry.level === 'critical_mistake' ? '💀' :
                             entry.level === 'wrong' ? '✗' :
                             entry.level === 'borderline' ? '🤔' :
                             entry.level === 'obvious' ? '👍' : '✓'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteHistory(index)}
                        className="ml-3 p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded transition-colors"
                        title={t('history.delete')}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setShowHistory(false)}
                className="w-full mt-6 bg-gray-600 hover:bg-gray-500 py-2 rounded-lg font-bold transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}

        {/* Range Chart Modal */}
        {showRangeChart && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-2 z-50">
            <div className="bg-gray-800 rounded-lg p-4 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">📊 {t('rangeChart.title')}</h2>
                <button
                  onClick={() => setShowRangeChart(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Range Type Tabs */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setSelectedRangeType('open')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                    selectedRangeType === 'open' ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  {t('rangeChart.open')}
                </button>
                <button
                  onClick={() => setSelectedRangeType('vsOpen')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                    selectedRangeType === 'vsOpen' ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  {t('rangeChart.vsOpen')}
                </button>
              </div>

              {/* Position Selector */}
              {selectedRangeType === 'open' ? (
                <div className="flex flex-wrap gap-1 mb-3">
                  {(['UTG', 'HJ', 'CO', 'BTN', 'SB'] as Position[]).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setSelectedPosition(pos)}
                      className={`px-3 py-1 rounded text-sm font-bold transition-colors ${
                        selectedPosition === pos ? 'bg-green-600' : 'bg-gray-700'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 mb-3">
                  {/* Step 1: Select opener */}
                  <div>
                    <div className="text-xs text-gray-400 mb-1">{t('rangeChart.opener')}</div>
                    <div className="flex gap-1">
                      {(['UTG', 'HJ', 'CO', 'BTN'] as Position[]).map((pos) => (
                        <button
                          key={pos}
                          onClick={() => {
                            setSelectedOpener(pos);
                            // Reset hero to valid position for this opener
                            const heroMap: Record<string, string[]> = {
                              UTG: ['HJ', 'CO', 'BTN', 'SB', 'BB'],
                              HJ: ['CO', 'BTN', 'SB', 'BB'],
                              CO: ['BTN', 'SB', 'BB'],
                              BTN: ['SB', 'BB'],
                            };
                            const validHeroes = heroMap[pos] || ['BB'];
                            if (!validHeroes.includes(selectedHero)) {
                              setSelectedHero(validHeroes[validHeroes.length - 1] as Position);
                            }
                          }}
                          className={`px-3 py-2 rounded text-sm font-bold transition-colors ${
                            selectedOpener === pos ? 'bg-red-600' : 'bg-gray-700'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Select hero position */}
                  <div>
                    <div className="text-xs text-gray-400 mb-1">{t('rangeChart.yourPosition')}</div>
                    <div className="flex gap-1">
                      {(() => {
                        const validHeroes: Record<string, Position[]> = {
                          UTG: ['HJ', 'CO', 'BTN', 'SB', 'BB'],
                          HJ: ['CO', 'BTN', 'SB', 'BB'],
                          CO: ['BTN', 'SB', 'BB'],
                          BTN: ['SB', 'BB'],
                        };
                        return (validHeroes[selectedOpener] || ['BB']).map((pos) => (
                          <button
                            key={pos}
                            onClick={() => setSelectedHero(pos)}
                            className={`px-3 py-2 rounded text-sm font-bold transition-colors ${
                              selectedHero === pos ? 'bg-blue-600' : 'bg-gray-700'
                            }`}
                          >
                            {pos}
                          </button>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Current selection display */}
                  <div className="text-center text-sm bg-gray-700 rounded py-2">
                    <span className="text-blue-400 font-bold">{selectedHero}</span>
                    <span className="text-gray-400"> vs </span>
                    <span className="text-red-400 font-bold">{selectedOpener}</span>
                    <span className="text-gray-400"> {locale === 'ja' ? 'オープン' : 'open'}</span>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2 text-xs">
                {selectedRangeType === 'open' ? (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-600 rounded"></div>
                    <span className="text-gray-400">{t('rangeChart.legend.raise')}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-600 rounded"></div>
                      <span className="text-gray-400">{t('rangeChart.legend.threeBet')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-600 rounded"></div>
                      <span className="text-gray-400">{t('rangeChart.legend.call')}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-1 text-gray-500">
                  <span>|</span>
                  <span>{t('rangeChart.legend.suited')}</span>
                  <span>{t('rangeChart.legend.offsuit')}</span>
                </div>
              </div>

              {/* 13x13 Grid */}
              <div className="grid gap-[1px] text-[9px] font-mono" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
                {RANKS.map((row, i) =>
                  RANKS.map((col, j) => {
                    let hand: string;
                    if (i === j) {
                      hand = row + col; // Pair
                    } else if (i < j) {
                      hand = row + col + 's'; // Suited (above diagonal)
                    } else {
                      hand = col + row + 'o'; // Offsuit (below diagonal)
                    }

                    let bgColor = 'bg-gray-700';
                    let textColor = 'text-gray-500';

                    if (selectedRangeType === 'open') {
                      const range = OPEN_RANGES[selectedPosition];
                      if (range?.raise.includes(hand)) {
                        bgColor = 'bg-green-600';
                        textColor = 'text-white';
                      }
                    } else {
                      const rangeKey = `${selectedHero}_vs_${selectedOpener}`;
                      const range = VS_OPEN_RANGES[rangeKey];
                      if (range?.threebet.includes(hand)) {
                        bgColor = 'bg-red-600';
                        textColor = 'text-white';
                      } else if (range?.call.includes(hand)) {
                        bgColor = 'bg-blue-600';
                        textColor = 'text-white';
                      }
                    }

                    // スーテッド/オフスートで未選択時の色を変える
                    if (bgColor === 'bg-gray-700') {
                      bgColor = i < j ? 'bg-gray-600' : 'bg-gray-700'; // suited = lighter
                    }

                    return (
                      <div
                        key={`${i}-${j}`}
                        className={`aspect-square flex items-center justify-center rounded-sm ${bgColor} ${textColor}`}
                        title={i === j ? 'ペア' : i < j ? 'スーテッド' : 'オフスート'}
                      >
                        {i === j ? row + row : i < j ? row + col : col + row}
                      </div>
                    );
                  })
                )}
              </div>

              <button
                onClick={() => setShowRangeChart(false)}
                className="w-full mt-4 bg-gray-600 hover:bg-gray-500 py-2 rounded-lg font-bold transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}

        {!situation ? (
          <button
            onClick={startNewHand}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
          >
            {t('game.startTraining')}
          </button>
        ) : (
          <div className="space-y-4">
            {/* Table Visualization */}
            <div ref={situationRef}>
              <PokerTable
                heroPosition={situation.position}
                villainPosition={situation.type === 'vsOpen' ? situation.villainPosition : null}
              />
            </div>

            {/* Situation Display */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">{t('game.situation')}</div>
              <p className="text-lg mb-4">
                {situation.description.split(/(UTG|HJ|CO|BTN|SB|BB)/g).map((part, i) => {
                  if (part === situation.position) {
                    return <span key={i} className="text-blue-400 font-bold">{part}</span>;
                  }
                  if (situation.type === 'vsOpen' && part === situation.villainPosition) {
                    return <span key={i} className="text-red-400 font-bold">{part}</span>;
                  }
                  if (['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'].includes(part)) {
                    return <span key={i} className="text-gray-400">{part}</span>;
                  }
                  return part;
                })}
              </p>

              <div className="text-gray-400 text-sm mb-2">{t('game.yourHand')}</div>
              <div className="py-4 bg-gray-700 rounded-lg flex justify-center">
                <HandDisplay handData={situation.handData} />
              </div>
            </div>

            {/* Action Buttons - placeholder for spacing */}
            {!result && (
              <div className="h-20"></div>
            )}

            {/* Result */}
            {result && (
              <div ref={resultRef} className={`rounded-lg p-4 ${
                result.level === 'critical_mistake' ? 'bg-red-950' :
                result.level === 'wrong' ? 'bg-red-900' :
                result.level === 'borderline' ? 'bg-yellow-900' :
                result.level === 'obvious' ? 'bg-green-800' :
                'bg-green-900'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">
                    {result.level === 'critical_mistake' ? '💀' :
                     result.level === 'wrong' ? '✗' :
                     result.level === 'borderline' ? '🤔' :
                     result.level === 'obvious' ? '👍' :
                     '✓'}
                  </span>
                  <span className="text-xl font-bold">
                    {result.level === 'critical_mistake' ? t('result.criticalMistake') :
                     result.level === 'wrong' ? t('result.wrong') :
                     result.level === 'borderline' ? t('result.borderline') :
                     result.level === 'obvious' ? t('result.obvious') :
                     t('result.correct')}
                  </span>
                </div>
                {result.level === 'borderline' && (
                  <p className="text-yellow-300 text-sm mb-2">
                    {t('result.borderlineNote')}
                  </p>
                )}

                {/* 選択と正解を常に表示 */}
                <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t('result.yourChoice')}</span>
                    <span className={`font-bold px-3 py-1 rounded ${
                      result.isCorrect ? 'bg-green-700' : 'bg-gray-600'
                    }`}>
                      {result.userAction}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t('result.correctAnswer')}</span>
                    {result.level === 'borderline' && situation ? (
                      (() => {
                        const freq = getActionFrequency(situation);
                        if (freq) {
                          return (
                            <span className="font-bold px-3 py-1 rounded bg-yellow-700 font-mono">
                              {formatTopActions(freq, situation.type)}
                            </span>
                          );
                        }
                        return (
                          <span className="font-bold px-3 py-1 rounded bg-green-700">
                            {result.correctAction}
                          </span>
                        );
                      })()
                    ) : (
                      <span className="font-bold px-3 py-1 rounded bg-green-700">
                        {result.correctAction}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 whitespace-pre-line">{result.explanation}</p>

                {/* AI解説・質問ボタン（オンライン時のみ） */}
                {isOnline && !aiExplanation && !isExplaining && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={runAiExplanation}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>🤖</span> {t('ai.explainWithAi')}
                    </button>
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>💬</span> {showChat ? t('ai.close') : t('ai.question')}
                    </button>
                  </div>
                )}

                {isOnline && isExplaining && (
                  <div className="flex gap-2 mt-3">
                    <div className="flex-1 bg-black bg-opacity-30 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
                        <span className="text-gray-400 text-sm">{t('ai.generating')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>💬</span> {showChat ? t('ai.close') : t('ai.question')}
                    </button>
                  </div>
                )}

                {isOnline && aiExplanation && (
                  <div className="mt-3 bg-black bg-opacity-30 rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-2">
                      <span>🤖</span>
                      <span className="text-amber-400 text-sm font-bold">{t('ai.aiExplanation')}</span>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-line">{aiExplanation}</p>
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="mt-3 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>💬</span> {showChat ? t('ai.close') : t('ai.askQuestion')}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Chat Section（オンライン時のみ） */}
            {isOnline && showChat && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-3">{t('ai.questionSection')}</div>

                {chatHistory.length > 0 && (
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {chatHistory.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-blue-900 ml-8'
                            : 'bg-gray-700 mr-8'
                        }`}
                      >
                        {msg.isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span className="text-gray-400">{t('ai.thinking')}</span>
                          </div>
                        ) : (
                          <p className="whitespace-pre-line">{msg.content}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={t('ai.questionPlaceholder')}
                    className="flex-1 bg-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors"
                  >
                    {t('ai.send')}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        <p className="text-gray-500 text-xs text-center mt-8">
          {locale === 'ja' ? '※ ' : '* '}<button onClick={() => setShowRangeChart(true)} className="underline hover:text-gray-300 transition-colors">{t('footer.rangeLink')}</button>{locale === 'ja' ? 'に基づいています。実際のGTOはスタック・相手の傾向により変動します。' : '. Actual GTO varies by stack size and opponent tendencies.'}
        </p>
      </div>

      {/* Fixed Bottom Button Bar */}
      {situation && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 safe-area-pb">
          <div className="max-w-lg mx-auto">
            {!result ? (
              // Action buttons during question phase
              <div className={`grid gap-2 ${situation.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {situation.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAction(option)}
                    className={`py-3 px-2 rounded-lg font-bold transition-colors ${
                      situation.options.length === 3 ? 'text-base' : 'text-lg py-4 px-6'
                    } ${
                      option === 'Fold'
                        ? 'bg-gray-600 hover:bg-gray-500'
                        : option === 'Raise' || option === '3-Bet'
                        ? 'bg-red-600 hover:bg-red-500'
                        : 'bg-blue-600 hover:bg-blue-500'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              // Navigation button after answering - only next hand
              <button
                onClick={startNewHand}
                className="w-full bg-green-600 hover:bg-green-700 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                {t('game.nextHand')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
