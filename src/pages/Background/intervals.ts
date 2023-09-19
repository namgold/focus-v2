import { checkAndTryRemove, getStorage } from '../../utils/helper'

const watchTabs: Set<number> = new Set()

setInterval(async () => {
  const storageData = await getStorage()
  console.group('intervals')
  console.log('intervals - checkAndTryRemove current tab')
  checkAndTryRemove(null, storageData)

  await Promise.allSettled(
    Array.from(watchTabs).map(async tabId => {
      let tab
      try {
        tab = await chrome.tabs.get(tabId)
      } catch (e: any) {
        console.log('get tab error:', e, e?.message, e?.code)
        watchTabs.delete(tabId)
        return
      }
      console.log('intervals - checkAndTryRemove tab:', tab.id, tab.url)
      await checkAndTryRemove(tab, storageData)
    }),
  )
  console.groupEnd()
}, 1000)

export const addTab = (tabId: number) => {
  watchTabs.add(tabId)
}

export const addTabs = (tabIds: number[]) => {
  tabIds.forEach(tabId => watchTabs.add(tabId))
}
