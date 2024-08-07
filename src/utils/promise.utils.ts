export class PromiseTimeoutError extends Error {
  constructor() {
    super('Promise Timed-out')
    this.name = 'PromiseTimeoutError'
  }
}

function rejectAfter(ms: number) {
  return new Promise((_, reject) => setTimeout(() => reject(new PromiseTimeoutError()), ms))
}

export async function timeoutPromise<T extends Promise<K>, K = Awaited<T>>(
  promise: T,
  timeoutAfter: number
): Promise<K> {
  return Promise.race([promise, rejectAfter(timeoutAfter)]) as Promise<K>
}
