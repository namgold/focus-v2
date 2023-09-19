import { checkAndTryRemove, init } from '../../utils/helper'
import { addTab, addTabs } from './intervals'

// chrome.tabs.onUpdated.addListener((...e) => console.info('onUpdated: ', e))
// chrome.tabs.onActivated.addListener((...e) => console.info('onActivated: ', e));
// chrome.tabs.onMoved.addListener((...e) => console.info('onMoved: ', e));
// chrome.tabs.onHighlighted.addListener((...e) => console.info('onHighlighted: ', e));
// chrome.tabs.onDetached.addListener((...e) => console.info('onDetached: ', e));
// chrome.tabs.onAttached.addListener((...e) => console.info('onAttached: ', e));
// chrome.tabs.onRemoved.addListener((...e) => console.info('onRemoved: ', e));
// chrome.tabs.onReplaced.addListener((...e) => console.info('onReplaced: ', e));
// chrome.tabs.onZoomChange.addListener((...e) => console.info('onZoomChange: ', e));
// chrome.tabs.onCreated.addListener((...e) => console.info('onCreated: ', e));

chrome.tabs.onUpdated.addListener(async function (id, info, tab) {
  addTab(tab.id)
})

chrome.tabs.onActivated.addListener(async activeInfo => {
  addTab(activeInfo.tabId)
})

setInterval(async () => {
  try {
    const allTabIds = (
      await chrome.windows.getAll({
        populate: true,
      })
    )
      .map(window => window.tabs.map(tab => tab.id))
      .flat()
      .filter(Boolean)
    console.log('all tabs id: ', { allTabIds })
    addTabs(allTabIds)
  } catch {}
}, 10_000)

chrome.storage.onChanged.addListener(changes => {
  if (changes?.pausedActivated?.newValue) {
    try {
      const timeoutValue =
        changes.pausedActivated.newValue.timestamp + changes.pausedActivated.newValue.pauseAmount * 60000 - Date.now()
      setTimeout(() => {
        checkAndTryRemove(null, null)
      }, timeoutValue)
    } catch {}
  }
})

chrome.runtime.onInstalled.addListener(({ id, previousVersion, reason }) => {
  console.log('Extension has been installed', { id, previousVersion, reason })
  // clear();
  init()
})
