declare module 'use-chrome-storage' {
  function useChromeStorageSync<T>(key: string, initialValue?: T): [T, (value: T) => void, boolean, string]
}
