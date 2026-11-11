import { useMemo, useSyncExternalStore } from 'react';
import { fetchCodexUsage } from '../services/codex-usage';
import type { CodexUsageData } from '../types/codex';

interface UsageSnapshot {
  data: CodexUsageData | null;
  busy: boolean;
  error: string;
}

const initialSnapshot = (): UsageSnapshot => ({ data: null, busy: true, error: '' });

/** Each scope shares one request and polling timer across all mounted consumers. */
function createUsageStore(scope: string) {
  let snapshot = initialSnapshot();
  const listeners = new Set<() => void>();
  let interval: ReturnType<typeof setInterval> | null = null;
  let activeRequest: {
    controller: AbortController;
    timeout: ReturnType<typeof setTimeout>;
  } | null = null;

  function update(next: UsageSnapshot) {
    snapshot = next;
    listeners.forEach(listener => listener());
  }

  async function load(refresh = false) {
    if (activeRequest || listeners.size === 0) return;

    const controller = new AbortController();
    const request = {
      controller,
      timeout: setTimeout(() => controller.abort(), 20000),
    };
    activeRequest = request;
    update({ ...snapshot, busy: true });

    try {
      const data = await fetchCodexUsage(scope, refresh, controller.signal);
      if (activeRequest === request && !controller.signal.aborted) {
        update({ data, busy: true, error: '' });
      }
    } catch (error) {
      if (activeRequest === request) {
        update({
          data: null,
          busy: true,
          error: controller.signal.aborted
            ? 'A leitura local demorou mais que o esperado. Tente atualizar novamente.'
            : error instanceof Error ? error.message : 'Não foi possível atualizar o uso.',
        });
      }
    } finally {
      clearTimeout(request.timeout);
      if (activeRequest === request) {
        activeRequest = null;
        update({ ...snapshot, busy: false });
      }
    }
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1) {
      void load();
      interval = setInterval(() => {
        if (!document.hidden) void load();
      }, 30000);
    }

    return () => {
      listeners.delete(listener);
      if (listeners.size > 0) return;

      if (interval) clearInterval(interval);
      interval = null;
      if (activeRequest) {
        const request = activeRequest;
        activeRequest = null;
        clearTimeout(request.timeout);
        request.controller.abort();
      }
      // A later mount starts a fresh read instead of displaying an old scope snapshot.
      snapshot = initialSnapshot();
    };
  }

  return {
    subscribe,
    getSnapshot: () => snapshot,
    refresh: () => { void load(true); },
  };
}

const stores = new Map<string, ReturnType<typeof createUsageStore>>();

export function useCodexUsage(scope = 'workspace') {
  const store = useMemo(() => {
    let shared = stores.get(scope);
    if (!shared) {
      shared = createUsageStore(scope);
      stores.set(scope, shared);
    }
    return shared;
  }, [scope]);
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return { ...snapshot, refresh: store.refresh };
}
