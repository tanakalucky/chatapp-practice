# よく使用するパターンとコマンド

## 開発コマンド

### 基本開発フロー
```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run check

# コード品質チェック
npm run biome-check

# ビルド
npm run build

# プレビュー
npm run preview

# デプロイ
npm run deploy
```

### トラブルシューティング
```bash
# 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install

# Cloudflare Worker型生成
npm run cf-typegen

# 全体クリーンビルド
npm run build
```

## コードパターン

### React コンポーネント
```tsx
export function MyComponent() {
  return (
    <div className="flex items-center gap-4">
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        Click me
      </button>
    </div>
  )
}
```

### Hono API ルート
```ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello World' })
})

export default app
```

### TanStack Query
```tsx
import { useQuery } from '@tanstack/react-query'

function useApiData() {
  return useQuery({
    queryKey: ['api-data'],
    queryFn: async () => {
      const response = await fetch('/api/data')
      return response.json()
    }
  })
}
```

## ファイル構造パターン

### コンポーネント作成
```
src/react-app/
├── features/        # 機能別ディレクトリ
│   ├── create-room/
│   │   ├── components/  # create-room専用コンポーネント
│   │   ├── hooks/       # create-room専用フック
│   │   └── index.tsx    # メインコンポーネント
│   ├── chat-room/
│   │   ├── components/  # chat-room専用コンポーネント
│   │   ├── hooks/       # chat-room専用フック
│   │   └── index.tsx    # メインコンポーネント
│   └── route/
│       ├── components/  # route専用コンポーネント
│       ├── hooks/       # route専用フック
│       └── index.tsx    # ルーティング設定
├── components/      # 共通コンポーネント
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   └── ...
├── hooks/           # 共通フック
│   ├── useApi.ts
│   └── ...
└── assets/          # 静的アセット
    └── ...
```

### API ルート構造
```
src/worker/
├── index.ts         # メインエントリポイント
└── env.ts          # 環境変数定義
```

## 設定パターン

### TypeScript設定
- `tsconfig.json`: ベース設定
- `tsconfig.app.json`: React app用
- `tsconfig.worker.json`: Worker用
- `tsconfig.node.json`: Node.js用

### Tailwind CSS
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom CSS variables can be defined here if needed */
```

## デバッグパターン

### 開発時ログ
```ts
// Worker側
console.log('Worker:', data)

// React側
console.log('Client:', data)
```

### エラーハンドリング
```ts
try {
  // API処理
} catch (error) {
  console.error('API Error:', error)
  return c.json({ error: 'Internal Error' }, 500)
}
```