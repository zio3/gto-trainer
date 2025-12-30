# GTO プリフロップトレーナー

ポーカーのGTO（Game Theory Optimal）プリフロップ戦略を練習するためのWebアプリケーションです。

## 機能

- **プリフロップトレーニング**: 6-max 100bbのGTOレンジに基づいた練習問題
- **オープンレンジ**: UTG, HJ, CO, BTN, SBからのオープン判断
- **vs オープン**: BB vs BTN/CO/HJのディフェンス判断（3-Bet/Call/Fold）
- **AI解説**: Claude APIによるハンドごとの詳細解説
- **AIコーチング**: 練習結果の分析とアドバイス
- **回答レベル判定**: 重大ミス・ボーダーライン・正解などの段階的フィードバック

## 使用技術

- [Next.js](https://nextjs.org/) 15 (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Claude API](https://www.anthropic.com/) (Haiku / Sonnet)

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/zio3/gto-trainer.git
cd gto-trainer
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルをプロジェクトルートに作成し、Anthropic APIキーを設定します：

```bash
ANTHROPIC_API_KEY=your-api-key-here
```

APIキーは [Anthropic Console](https://console.anthropic.com/) から取得できます。

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## デプロイ

### Vercel（推奨）

1. [Vercel](https://vercel.com/) でプロジェクトをインポート
2. 環境変数 `ANTHROPIC_API_KEY` を設定
3. デプロイ

GitHubにプッシュすると自動でデプロイされます。

## API使用量の目安

| 機能 | モデル | 用途 |
|------|--------|------|
| ハンド解説 | Claude Haiku | 個別のハンド分析（低コスト） |
| チャット | Claude Sonnet | 質問への回答 |
| 練習分析 | Claude Sonnet | 10問ごとの総合分析 |

## 注意事項

- このアプリは簡易版GTOレンジに基づいています
- 実際のGTOはスタック・相手の傾向により変動します
- 学習目的での使用を推奨します

## ライセンス

MIT
