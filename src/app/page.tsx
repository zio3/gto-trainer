'use client';

import { useState, useCallback, useRef } from 'react';
import HandDisplay from '@/components/HandDisplay';
import PokerTable from '@/components/PokerTable';
import { generateSituation, getCorrectAction, getExplanation, getAnswerLevel } from '@/lib/game-logic';
import { Situation, Result, Stats, AnswerHistoryEntry, ChatMessage, Action } from '@/lib/types';

export default function GTOTrainer() {
  const [situation, setSituation] = useState<Situation | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [stats, setStats] = useState<Stats>({ correct: 0, total: 0 });
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

  const resultRef = useRef<HTMLDivElement>(null);
  const situationRef = useRef<HTMLDivElement>(null);

  const startNewHand = useCallback(() => {
    setSituation(generateSituation());
    setResult(null);
    setShowChat(false);
    setChatHistory([]);
    setAiExplanation(null);
    // 次のハンド開始時にシチュエーション部分へスクロール
    setTimeout(() => {
      situationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  // AI解説を取得
  const runAiExplanation = async () => {
    if (!situation || !result) return;

    setIsExplaining(true);

    const situationText = situation.type === 'open'
      ? `${situation.position}からのオープン判断。フォールドで回ってきた。`
      : `BBで${situation.villainPosition}の2.5bbオープンに対する判断。`;

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
        }),
      });

      const data = await response.json();
      if (data.error) {
        setAiExplanation('解説の取得に失敗しました: ' + data.error);
      } else {
        setAiExplanation(data.text);
      }
    } catch (error) {
      setAiExplanation('解説の取得に失敗しました: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsExplaining(false);
    }
  };

  // AI分析を実行（ストリーミング）
  const runAnalysis = async () => {
    if (answerHistory.length < 5) {
      alert('分析には最低5問の回答が必要です');
      return;
    }

    setIsAnalyzing(true);
    setShowAnalysis(true);
    setAnalysis('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: answerHistory,
          stats,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setAnalysis('分析中にエラーが発生しました: ' + (errorData.error || 'Unknown error'));
        setIsAnalyzing(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setAnalysis('ストリーミングに失敗しました');
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
      setAnalysis('分析中にエラーが発生しました: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
      { role: 'assistant', content: '考え中...', isLoading: true },
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
        }),
      });

      const data = await response.json();
      const text = data.error ? 'エラーが発生しました: ' + data.error : data.text;

      setAnalysisChatHistory(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: text },
      ]);
    } catch (error) {
      setAnalysisChatHistory(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'エラーが発生しました: ' + (error instanceof Error ? error.message : 'Unknown error') },
      ]);
    }
  };

  const handleAction = (action: Action) => {
    if (!situation) return;

    const correctAction = getCorrectAction(situation);
    const explanation = getExplanation(situation, correctAction);
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

    // 履歴に追加
    const historyEntry: AnswerHistoryEntry = {
      situation: situation.type === 'open'
        ? `${situation.position}オープン`
        : `BB vs ${situation.villainPosition}`,
      hand: situation.hand,
      correct: correctAction,
      user: action,
      isCorrect,
      level,
    };
    setAnswerHistory(prev => [...prev, historyEntry]);

    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
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
    setStats(prev => ({
      correct: prev.correct - (entry.isCorrect ? 1 : 0),
      total: prev.total - 1,
    }));

    // 履歴から削除
    setAnswerHistory(prev => prev.filter((_, i) => i !== index));
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
      { role: 'assistant', content: '考え中...', isLoading: true },
    ]);

    // コンテキスト情報を構築
    const situationContext = situation.type === 'open'
      ? `${situation.position}からのオープン判断`
      : `BB vs ${situation.villainPosition}のオープンに対する判断`;

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
        }),
      });

      const data = await response.json();
      const text = data.error ? 'エラーが発生しました: ' + data.error : data.text;

      // ローディング状態を実際の回答で置き換え
      setChatHistory(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: text },
      ]);
    } catch (error) {
      setChatHistory(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'エラーが発生しました: ' + (error instanceof Error ? error.message : 'Unknown error') },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-32">
      <div className="max-w-lg mx-auto p-4">
        <h1 className="text-2xl font-bold text-center mb-2">GTO プリフロップトレーナー</h1>
        <p className="text-gray-400 text-center text-sm mb-6">6-max / 100bb</p>

        {/* Stats */}
        <div className="bg-gray-800 rounded-lg p-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">正解率</span>
            <span className="text-xl font-bold">
              {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
              <span className="text-sm text-gray-400 ml-2">({stats.correct}/{stats.total})</span>
            </span>
          </div>
          {stats.total > 0 && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={runAnalysis}
                disabled={stats.total < 5}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1 ${
                  stats.total >= 5
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>📊</span> AI分析{stats.total < 5 && <span className="text-xs ml-1">(あと{5 - stats.total}問)</span>}
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 px-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
              >
                <span>📝</span> 履歴を見る
              </button>
            </div>
          )}
        </div>

        {/* Analysis Modal */}
        {showAnalysis && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">📊 AI分析レポート</h2>
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
                    <p className="text-gray-400">分析中...</p>
                  </div>
                ) : null}
                {isAnalyzing && analysis && (
                  <div className="flex items-center gap-2 mt-4 text-purple-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
                    <span className="text-sm">生成中...</span>
                  </div>
                )}
              </div>

              {/* 分析に対するチャット */}
              {!isAnalyzing && analysis && (
                <div className="mt-6 border-t border-gray-700 pt-4">
                  <div className="text-gray-400 text-sm mb-3">分析について質問</div>

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
                              <span className="text-gray-400">考え中...</span>
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
                      placeholder="この分析についてもっと詳しく..."
                      className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      送信
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
                閉じる
              </button>
            </div>
          </div>
        )}

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">📝 回答履歴</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {answerHistory.length === 0 ? (
                <p className="text-gray-400 text-center py-8">履歴がありません</p>
              ) : (
                <div className="space-y-2">
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
                        title="削除"
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
                閉じる
              </button>
            </div>
          </div>
        )}

        {!situation ? (
          <button
            onClick={startNewHand}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
          >
            トレーニング開始
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
              <div className="text-gray-400 text-sm mb-2">シチュエーション</div>
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

              <div className="text-gray-400 text-sm mb-2">あなたのハンド</div>
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
                    {result.level === 'critical_mistake' ? 'これは覚えよう！' :
                     result.level === 'wrong' ? '不正解' :
                     result.level === 'borderline' ? '微妙なライン' :
                     result.level === 'obvious' ? '完璧！' :
                     '正解！'}
                  </span>
                </div>
                {result.level === 'borderline' && (
                  <p className="text-yellow-300 text-sm mb-2">
                    ※ このハンドはボーダーラインです。{result.isCorrect ? '正解ですが、' : ''}状況によってはどちらの選択もありえます。
                  </p>
                )}

                {/* 選択と正解を常に表示 */}
                <div className="bg-black bg-opacity-30 rounded-lg p-3 mb-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">あなたの選択:</span>
                    <span className={`font-bold px-3 py-1 rounded ${
                      result.isCorrect ? 'bg-green-700' : 'bg-gray-600'
                    }`}>
                      {result.userAction}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">正解:</span>
                    <span className="font-bold px-3 py-1 rounded bg-green-700">
                      {result.correctAction}
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 whitespace-pre-line">{result.explanation}</p>

                {/* AI解説・質問ボタン */}
                {!aiExplanation && !isExplaining && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={runAiExplanation}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>🤖</span> AIで詳しく解説
                    </button>
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>💬</span> {showChat ? '閉じる' : '質問'}
                    </button>
                  </div>
                )}

                {isExplaining && (
                  <div className="flex gap-2 mt-3">
                    <div className="flex-1 bg-black bg-opacity-30 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
                        <span className="text-gray-400 text-sm">AI解説を生成中...</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>💬</span> {showChat ? '閉じる' : '質問'}
                    </button>
                  </div>
                )}

                {aiExplanation && (
                  <div className="mt-3 bg-black bg-opacity-30 rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-2">
                      <span>🤖</span>
                      <span className="text-amber-400 text-sm font-bold">AI解説</span>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-line">{aiExplanation}</p>
                    <button
                      onClick={() => setShowChat(!showChat)}
                      className="mt-3 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <span>💬</span> {showChat ? '閉じる' : '質問する'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Chat Section */}
            {showChat && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-3">質問・疑問点</div>

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
                            <span className="text-gray-400">考え中...</span>
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
                    placeholder="なぜこのハンドを...？"
                    className="flex-1 bg-gray-700 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors"
                  >
                    送信
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        <p className="text-gray-500 text-xs text-center mt-8">
          ※ 簡易版GTOレンジに基づいています。実際のGTOはスタック・相手の傾向により変動します。
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
                次のハンド
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
