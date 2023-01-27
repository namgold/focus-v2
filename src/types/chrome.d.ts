declare namespace chrome.storage {
  export interface StorageArea {
    get<T>(key: string): Promise<{ [key: string]: T }>
  }
}
