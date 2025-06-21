# Code Style Guide

## 関数定義の順序

### 原則
**関数は抽象度の高い順に上から下に定義する**

読み手が最初に概要を把握してから具体的な実装詳細を読めるように、抽象度の高いコードを上に、低いコードを下に配置する。

### 例: useCreateRoom.ts

```typescript  
// ✅ 良い例: useCreateRoom（高抽象度） → createRoom（低抽象度）の順序
export const useCreateRoom = () => {
  const [, setLocation] = useLocation();
  
  return useMutation({
    mutationFn: createRoom, // 何をするかの概要
    onSuccess: (data) => {
      setLocation(`/room/${data.roomId}`);
    },
  });
};

const createRoom = async (): Promise<{ roomId: string }> => {
  // 具体的な実装詳細
  const response = await fetch('/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error('Failed to create room');
  }
  
  return response.json();
};
```

### 理由
- 最初に「何をするか」の概要を把握できる
- その後に「どうやってするか」の実装詳細を読める
- 抽象度の高い順に配置することで理解しやすくなる
- トップダウンの思考に合致する