'use client';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from '@/lib/store';

// A store-per-mount factory (not a module singleton): `/` is genuinely server-rendered, so a
// shared store instance would leak state across concurrent requests. The lazy useState
// initializer creates the store exactly once and keeps it stable across re-renders.
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());
  return <Provider store={store}>{children}</Provider>;
}
