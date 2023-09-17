import { storage } from '../../constants'
import { checkAndTryRemove } from '../../utils/helper'

const tabs: {
  [id: string]: {
    exist: boolean
    tabId: number
  }
} = {}

setInterval(async () => {
  const storageData = (await storage.get()) as Storage

  console.log('intervals - checkAndTryRemove current tab')
  checkAndTryRemove(null, storageData)

  Object.entries(tabs).forEach(async ([tabId, tabInfo]) => {
    if (!tabInfo.exist) return
    let tab
    try {
      tab = await chrome.tabs.get(tabInfo.tabId)
    } catch (e) {
      tabs[tabId].exist = false
      return
    }
    console.log('intervals - checkAndTryRemove tab:', tab.id, tab.url)
    await checkAndTryRemove(tab, storageData)
  })
}, 1000)

export const addTab = (tabId: number) => {
  tabs[tabId] = {
    exist: true,
    tabId,
  }
}
