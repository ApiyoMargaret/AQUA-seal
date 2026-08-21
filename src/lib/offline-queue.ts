export interface OfflineQueueItem {
  id: string;
  type: 'CREATE_BATCH' | 'APPEND_EVENT';
  payload: any;
  timestamp: string;
  attempts: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'RESOLVED';
  error?: string;
}

const STORAGE_KEY = 'aqua_seal_offline_queue_v1';

class OfflineQueueManager {
  private listeners: (() => void)[] = [];

  getItems(): OfflineQueueItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveItems(items: OfflineQueueItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save offline queue', e);
    }
  }

  enqueue(type: 'CREATE_BATCH' | 'APPEND_EVENT', payload: any): OfflineQueueItem {
    const item: OfflineQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      attempts: 0,
      status: 'PENDING',
    };

    const items = this.getItems();
    items.push(item);
    this.saveItems(items);
    return item;
  }

  removeItem(id: string) {
    const items = this.getItems().filter((i) => i.id !== id);
    this.saveItems(items);
  }

  updateItemStatus(id: string, status: OfflineQueueItem['status'], error?: string) {
    const items = this.getItems().map((i) => {
      if (i.id === id) {
        return {
          ...i,
          status,
          attempts: i.attempts + 1,
          error,
        };
      }
      return i;
    });
    this.saveItems(items);
  }

  clearQueue() {
    this.saveItems([]);
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l());
  }

  async syncAll(apiBaseUrl: string = '/api'): Promise<{ synced: number; failed: number }> {
    const items = this.getItems().filter((i) => i.status !== 'SYNCING');
    if (items.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;

    for (const item of items) {
      this.updateItemStatus(item.id, 'SYNCING');
      try {
        if (item.type === 'CREATE_BATCH') {
          const res = await fetch(`${apiBaseUrl}/batches`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...item.payload,
              channel: 'WEB_OFFLINE_SYNC',
            }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } else if (item.type === 'APPEND_EVENT') {
          const res = await fetch(`${apiBaseUrl}/batches/${item.payload.batchId}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...item.payload,
              channel: 'WEB_OFFLINE_SYNC',
            }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        }

        this.removeItem(item.id);
        synced += 1;
      } catch (err: any) {
        failed += 1;
        this.updateItemStatus(item.id, 'FAILED', err?.message || 'Sync failed');
      }
    }

    return { synced, failed };
  }
}

export const offlineQueue = new OfflineQueueManager();