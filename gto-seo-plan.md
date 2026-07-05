# GTO プリフロップトレーナー SEO改善計画

## 現状

- サイト: https://gto-trainer-eight.vercel.app/
- Googleにインデックスされていない（`site:` 検索で結果なし）
- SEO設定は最低限のみ

---

## Phase 1: インデックス登録（最優先）

### 1-1. Google Search Console 登録

1. https://search.google.com/search-console にアクセス
2. 「プロパティを追加」→「URLプレフィックス」を選択
3. `https://gto-trainer-eight.vercel.app` を入力
4. 所有権確認（以下のいずれか）
   - HTMLタグをheadに追加（推奨）
   - HTMLファイルをpublicフォルダに配置

### 1-2. 所有権確認用のメタタグ追加

`layout.tsx` の metadata に追加：

```tsx
export const metadata: Metadata = {
  // ... 既存の設定
  verification: {
    google: 'ここにSearch Consoleから取得したコードを入れる',
  },
};
```

### 1-3. サイトマップ作成

`next-sitemap` パッケージを使用：

```bash
npm install next-sitemap
```

プロジェクトルートに `next-sitemap.config.js` を作成：

```js
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://gto-trainer-eight.vercel.app',
  generateRobotsTxt: true,
  outDir: './public',
};
```

`package.json` に追加：

```json
{
  "scripts": {
    "postbuild": "next-sitemap"
  }
}
```

### 1-4. インデックス登録リクエスト

1. Search Console で「URL検査」
2. サイトURLを入力
3. 「インデックス登録をリクエスト」をクリック
4. サイトマップも送信（Search Console → サイトマップ → sitemap.xml を追加）

---

## Phase 2: SEO基盤整備

### 2-1. title / description 改善

`layout.tsx` を以下のように修正：

```tsx
export const metadata: Metadata = {
  title: "GTO プリフロップトレーナー | 無料・登録不要でポーカーのレンジを練習",
  description: "アカウント登録不要・完全無料のGTOプリフロップトレーナー。6-max/100bbのオープンレンジ・コールレンジをクイズ形式で練習できます。日本語対応。",
  manifest: "/manifest.json",
  verification: {
    google: 'Search Consoleのコード',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GTO Trainer",
  },
  openGraph: {
    title: 'GTO プリフロップトレーナー | 無料ポーカー練習ツール',
    description: 'アカウント不要・無料でポーカーのGTOプリフロップを練習。6-max対応。',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://gto-trainer-eight.vercel.app',
    siteName: 'GTO プリフロップトレーナー',
    images: [
      {
        url: '/ogp.png',
        width: 1200,
        height: 630,
        alt: 'GTO プリフロップトレーナー',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GTO プリフロップトレーナー',
    description: '無料・登録不要でポーカーのGTOを練習',
    images: ['/ogp.png'],
  },
  keywords: ['GTO', 'ポーカー', 'プリフロップ', '練習', 'トレーナー', '無料', 'レンジ', '6-max'],
};
```

### 2-2. OGP画像作成

- サイズ: 1200 x 630 px
- 内容案:
  - タイトル「GTO プリフロップトレーナー」
  - サブタイトル「無料・登録不要」
  - ポーカーテーブルのイメージ
- 保存先: `public/ogp.png`

---

## Phase 3: コンテンツ強化（後回しでOK）

### 3-1. フッターに説明文追加

検索エンジンが読めるテキストを追加：

```tsx
<footer className="text-gray-500 text-sm p-4 text-center">
  <p>
    GTOプリフロップトレーナーは、ポーカーのGTO（Game Theory Optimal）戦略に基づいた
    プリフロップアクションを練習できる無料ツールです。
    6-max/100bbのシチュエーションで、オープンレンジやコールレンジを
    クイズ形式で学習できます。アカウント登録不要ですぐに始められます。
  </p>
</footer>
```

### 3-2. 追加ページ（任意）

- `/about` - ツールの詳細説明
- `/how-to-use` - 使い方ガイド
- `/gto-guide` - GTO入門記事

---

## 確認方法

### インデックス確認

Google検索で以下を実行：

```
site:gto-trainer-eight.vercel.app
```

結果が表示されればインデックス済み。

### Search Console で確認

- インデックス状況
- 検索クエリ（どんなキーワードで表示されたか）
- クリック数・表示回数

---

## スケジュール目安

| Phase | 作業時間 | 結果が出るまで |
|-------|---------|---------------|
| Phase 1 | 1-2時間 | 数日〜1週間 |
| Phase 2 | 1-2時間 | Phase 1と同時でOK |
| Phase 3 | 必要に応じて | - |

**Phase 1 + 2 を実施後、1〜2週間待って結果を確認する。**

---

## 狙うキーワード

- 「GTO ポーカー 練習」
- 「プリフロップ 練習」
- 「ポーカー レンジ 練習」
- 「GTO トレーナー 無料」
- 「ポーカー ハンド 練習」

---

## 参考リンク

- [Google Search Console](https://search.google.com/search-console)
- [next-sitemap](https://github.com/iamvishnusankar/next-sitemap)
