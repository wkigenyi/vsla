import { QueuedTransaction } from "@/lib/types/fineract";

const SYNC_QUEUE_KEY = "vsla_sync_queue";

export function addToSyncQueue(transaction: Omit<QueuedTransaction, "id" | "createdAt" | "retryCount" | "status">): void {
  if (typeof window === "undefined") return;

  const queue = getSyncQueue();
  const newTransaction: QueuedTransaction = {
    ...transaction,
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    retryCount: 0,
    status: "PENDING",
  };

  queue.push(newTransaction);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function getSyncQueue(): QueuedTransaction[] {
  if (typeof window === "undefined") return [];

  try {
    const queue = localStorage.getItem(SYNC_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error("Failed to get sync queue:", error);
    return [];
  }
}

export function removeFromSyncQueue(transactionId: string): void {
  if (typeof window === "undefined") return;

  const queue = getSyncQueue();
  const updatedQueue = queue.filter((txn) => txn.id !== transactionId);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
}

export function updateTransactionStatus(
  transactionId: string,
  status: QueuedTransaction["status"],
  retryCount?: number
): void {
  if (typeof window === "undefined") return;

  const queue = getSyncQueue();
  const updatedQueue = queue.map((txn) =>
    txn.id === transactionId
      ? { ...txn, status, retryCount: retryCount ?? txn.retryCount }
      : txn
  );
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(updatedQueue));
}

export function getPendingTransactionsCount(): number {
  const queue = getSyncQueue();
  return queue.filter((txn) => txn.status === "PENDING").length;
}

export async function processSyncQueue(): Promise<void> {
  const queue = getSyncQueue();
  const pendingTransactions = queue.filter((txn) => txn.status === "PENDING");

  for (const transaction of pendingTransactions) {
    try {
      updateTransactionStatus(transaction.id, "PROCESSING");

      const response = await fetch(transaction.endpoint, {
        method: transaction.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction.body),
      });

      if (response.ok) {
        removeFromSyncQueue(transaction.id);
      } else {
        const newRetryCount = transaction.retryCount + 1;
        if (newRetryCount >= 3) {
          updateTransactionStatus(transaction.id, "FAILED", newRetryCount);
        } else {
          updateTransactionStatus(transaction.id, "PENDING", newRetryCount);
        }
      }
    } catch (error) {
      const newRetryCount = transaction.retryCount + 1;
      if (newRetryCount >= 3) {
        updateTransactionStatus(transaction.id, "FAILED", newRetryCount);
      } else {
        updateTransactionStatus(transaction.id, "PENDING", newRetryCount);
      }
    }
  }
}
