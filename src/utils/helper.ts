import { DEFAULT, storage } from '../constants/index'
import { TEMPORARY_DISABLE_TIME } from './../constants/index'
import { addKeyBlockWebsites, tryLoop } from './index'

export const clear = () => {
  storage.clear()
}

export const init = () => {
  storage.get(storageData => {
    DEFAULT.blockWebsites.forEach(website => addKeyBlockWebsites(website))
    storage.set(Object.assign({}, DEFAULT, storageData))
  })
}

export const reset = () => {
  clear()
  init()
}

export const getActivatedTab = async (): Promise<chrome.tabs.Tab | undefined> => {
  return (
    await tryLoop(
      () => chrome.tabs.query({ active: true, lastFocusedWindow: true }),
      500,
      1,
      tabs => Boolean(tabs.length),
    )
  )?.[0]
}

enum TIME_STATUS {
  BLOCKING_ALLOW_PAUSE = 'BLOCKING_ALLOW_PAUSE',
  PAUSING = 'PAUSING',
  BLOCKING_PREVENT_PAUSE = 'BLOCKING_PREVENT_PAUSE',
  DISABLED = 'DISABLED',
}

export const getTimeStatus = (storageData: StorageType): TIME_STATUS => {
  if (
    storageData.pausedActivated &&
    Number.isInteger(storageData.pausedActivated.timestamp) &&
    Number.isInteger(storageData.pausedActivated.pauseAmount) &&
    Number.isInteger(storageData.pausedActivated.resetAmount)
  ) {
    if (storageData.activated) {
      // -timeline---|---------->-----------------[pausedTimestamp]-----> pauseAmount >--------[pauseEndTimestamp]-----------> resetAmount >----------[resetTimestamp]------------->--------------
      // -now status-|-----BLOCKING_ALLOW_PAUSE-----------|----------------PAUSING----------------------|-----------------BLOCKING_PREVENT_PAUSE-------------|-----------BLOCKING_ALLOW_PAUSE-----
      const now = Date.now()
      const pausedTimestamp = storageData.pausedActivated.timestamp
      const pauseEndTimestamp = pausedTimestamp + storageData.pausedActivated.pauseAmount * 60000
      const resetTimestamp = pausedTimestamp + storageData.pausedActivated.resetAmount * 60000
      if (now < pausedTimestamp || now >= resetTimestamp) return TIME_STATUS.BLOCKING_ALLOW_PAUSE
      if (pausedTimestamp <= now && now < pauseEndTimestamp) return TIME_STATUS.PAUSING
      if (pauseEndTimestamp <= now && now < resetTimestamp) return TIME_STATUS.BLOCKING_PREVENT_PAUSE
      return TIME_STATUS.DISABLED
    } else {
      return TIME_STATUS.DISABLED
    }
  } else {
    return TIME_STATUS.DISABLED
  }
}

const isBlockTime = (storageData: StorageType) => {
  const timeStatus = getTimeStatus(storageData)
  return timeStatus === TIME_STATUS.BLOCKING_ALLOW_PAUSE || timeStatus === TIME_STATUS.BLOCKING_PREVENT_PAUSE
}

// what does findBlockWebsite different from isMatchedBlockWebsite?
// findBlockWebsite: check if url is in the blockWebsites list
// isMatchedBlockWebsite: check if url is in the active of blockWebsites list
// findBlockWebsite: dont care about those non active websites because we are going to active it again
// isMatchedBlockWebsite: care about if those saved website is active or not, so their result wont count those inactive website
export const findBlockWebsite = (url: string | undefined, blockWebsites: Website[]): Website | undefined => {
  let u: URL
  try {
    if (!url) throw new Error('URL "' + url + '" is invalid')
    if (url.startsWith('chrome-extension://')) throw new Error()
    if (url.startsWith('chrome://')) throw new Error()
    u = new URL(url)
  } catch (e: any) {
    if (e instanceof Error && e.message) console.warn(e.message)
    return undefined
  }
  const result = blockWebsites.find(blockWebsite => u.hostname.toLowerCase().includes(blockWebsite.url.toLowerCase()))
  return result
}

// determine if current website satisfies the blacklist
const isMatchedBlockWebsite = (url: string | undefined, blockWebsites: Website[]): boolean => {
  let u: URL
  try {
    if (!url) throw new Error('URL "' + url + '" is invalid')
    if (url.startsWith('chrome-extension://')) throw new Error()
    if (url.startsWith('chrome://')) throw new Error()
    u = new URL(url)
  } catch (e: any) {
    if (e instanceof Error && e.message) console.warn(e.message)
    return false
  }
  const result = !!blockWebsites?.find(
    blockWebsite => isEnabledBlock(blockWebsite) && u.hostname.toLowerCase().includes(blockWebsite.url.toLowerCase()),
  )
  return result
}

// determine if current website should be block
export const isBlockedWebsite = (url: string, blockWebsites: Website[]): boolean => {
  if (url) return isMatchedBlockWebsite(url, blockWebsites)
  return false
}

const isShouldRemove = (url: string, storageData: StorageType): boolean => {
  if (isBlockTime(storageData)) {
    const isBlock = isBlockedWebsite(url, storageData.blockWebsites)
    return isBlock
  }
  return false
}

export const checkAndTryRemove = async (
  tab: chrome.tabs.Tab | null,
  storageParam: StorageType | null,
): Promise<void> => {
  const storageData = storageParam || ((await getStorage()) as StorageType)
  const activeTab = tab || (await getActivatedTab()) || { url: undefined, id: undefined }

  const run = async (): Promise<void> => {
    try {
      if (!isBlockTime(storageData)) return
      const { url, id } = activeTab
      if (!id || !url) return
      const shouldRemove = isShouldRemove(url, storageData)
      if (shouldRemove) {
        console.log('checkAndTryRemove tryRemove', { id })
        await tryLoop(() => chrome.tabs.remove(id), 500, 5, undefined, 'Remove Tab')
      }
    } catch {}
  }

  console.groupCollapsed('checkAndTryRemove start')
  console.groupCollapsed('trace')
  console.trace()
  console.groupEnd()
  console.log('checkAndTryRemove params:', { tab })
  const result = await run()
  console.log('checkAndTryRemove result', result)
  console.groupEnd()
  return result
}

export const getStorage = async (): Promise<StorageType> => {
  const storageData = await storage.get()
  return {
    ...DEFAULT,
    ...storageData,
  }
}

export const isEnabledBlock = (website: Website): boolean => {
  return website.active && (website.temporaryDisableTimestamp || 0) + TEMPORARY_DISABLE_TIME < Date.now()
}
