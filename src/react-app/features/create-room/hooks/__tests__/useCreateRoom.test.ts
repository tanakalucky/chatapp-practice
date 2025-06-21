import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCreateRoom } from '../useCreateRoom';

// Wouter routerのモック
const mockSetLocation = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => ['/current', mockSetLocation],
}));

// fetchのモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// テスト用のQueryClientProvider wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useCreateRoom', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockSetLocation.mockClear();
  });

  it('部屋作成が成功した場合、適切なAPIを呼び出しリダイレクトする', async () => {
    const mockRoomId = 'test-room-123';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ roomId: mockRoomId }),
    });

    const { result } = renderHook(() => useCreateRoom(), {
      wrapper: createWrapper(),
    });

    // mutation実行
    result.current.mutate();

    // mutationの状態確認を先に行う
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // API呼び出しが正しく実行されることを確認
    expect(mockFetch).toHaveBeenCalledWith('/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 成功時のリダイレクトを確認
    expect(mockSetLocation).toHaveBeenCalledWith(`/room/${mockRoomId}`);
  });

  it('部屋作成が失敗した場合、エラーが発生しリダイレクトしない', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useCreateRoom(), {
      wrapper: createWrapper(),
    });

    // mutation実行
    result.current.mutate();

    // エラー状態の確認
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // エラーメッセージの確認
    expect(result.current.error?.message).toBe('Failed to create room');

    // リダイレクトが実行されないことを確認
    expect(mockSetLocation).not.toHaveBeenCalled();
  });

  it('mutation実行中はローディング状態になる', async () => {
    // 遅延を持つPromiseを作成
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockReturnValueOnce(delayedPromise);

    const { result } = renderHook(() => useCreateRoom(), {
      wrapper: createWrapper(),
    });

    // mutation実行
    result.current.mutate();

    // ローディング状態の確認（非同期で状態が変わるのを待つ）
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);

    // Promiseを解決してテストを完了
    resolvePromise!({
      ok: true,
      json: async () => ({ roomId: 'test-room' }),
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
  });

  it('fetchが例外を投げた場合、適切にエラーハンドリングされる', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useCreateRoom(), {
      wrapper: createWrapper(),
    });

    // mutation実行
    result.current.mutate();

    // エラー状態の確認
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // ネットワークエラーが伝播されることを確認
    expect(result.current.error).toBe(networkError);

    // リダイレクトが実行されないことを確認
    expect(mockSetLocation).not.toHaveBeenCalled();
  });
});
