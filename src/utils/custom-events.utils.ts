interface CustomEventMap {
  'update-search': CustomEvent<string>
}
declare global {
  interface Document {
    addEventListener<K extends keyof CustomEventMap>(
      type: K,
      listener: (this: Document, ev: CustomEventMap[K]) => void
    ): void
    dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void
  }
}

export function updateSearchEventFactory(query: string) {
  return new CustomEvent('update-search', { detail: query })
}
