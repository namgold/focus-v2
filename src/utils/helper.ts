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

// async function getCurrentTab(): Promise<chrome.tabs.Tab> {
//   const run = async (): Promise<chrome.tabs.Tab> => {
//     let queryOptions = { active: true, lastFocusedWindow: true }
//     // `tab` will either be a `tabs.Tab` instance or `undefined`.
//     let [tab] = await chrome.tabs.query(queryOptions)
//     return tab
//   }

//   console.group('getCurrentTab start')
//   console.trace()
//   console.log('getCurrentTab params:', {})
//   const result = await run()
//   console.log('getCurrentTab result', result)
//   console.groupEnd()
//   return result
// }

export const getActivatedTab = async (): Promise<chrome.tabs.Tab | undefined> => {
  const run = async (): Promise<chrome.tabs.Tab | undefined> => {
    return (
      await tryLoop(
        () => chrome.tabs.query({ active: true, lastFocusedWindow: true }),
        100,
        10,
        tabs => Boolean(tabs.length),
        'getActivatedTab',
      )
    )?.[0]
  }

  console.group('getActivatedTab start')
  console.log('getActivatedTab params:', {})
  const result = await run()
  console.log('getActivatedTab result', result)
  console.groupEnd()
  return result
}

export enum TIME_STATUS {
  BLOCKING_ALLOW_PAUSE,
  PAUSING,
  BLOCKING_PREVENT_PAUSE,
  DISABLED,
}

type Storage = {
  pausedActivated?: {
    timestamp?: number
    pauseAmount?: number
    resetAmount?: number
  }
  activated?: boolean
}

export const getTimeStatus = async (storageDataParam?: { [key: string]: any }): Promise<TIME_STATUS> => {
  const run = async (storageDataParam?: { [key: string]: any }): Promise<TIME_STATUS> => {
    const storageData: Storage = storageDataParam || (await storage.get())
    if (
      storageData.pausedActivated &&
      Number.isInteger(storageData.pausedActivated.timestamp) &&
      Number.isInteger(storageData.pausedActivated.pauseAmount) &&
      Number.isInteger(storageData.pausedActivated.resetAmount)
    ) {
      if (storageData.activated) {
        // -timeline-|---------->-----------------pausedTimestamp----->--------pauseEndTimestamp---------------->------------resetTimestamp------------->--------------
        // -now------|-----BLOCKING_ALLOW_PAUSE---------------------PAUSING-------------------------BLOCKING_PREVENT_PAUSE--------------------BLOCKING_ALLOW_PAUSE-----
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

  console.group('getTimeStatus start')
  console.log('getTimeStatus params:', { storageDataParam })
  const result = await run(storageDataParam)
  console.log('getTimeStatus result:', result)
  console.groupEnd()
  return result
}

const isBlockTime = async (storageDataParam?: { [key: string]: any }) => {
  const storageData: Storage = storageDataParam || (await storage.get())
  const timeStatus = await getTimeStatus(storageData)
  return timeStatus === TIME_STATUS.BLOCKING_ALLOW_PAUSE || timeStatus === TIME_STATUS.BLOCKING_PREVENT_PAUSE
}

// what does findBlockWebsite different from isMatchedBlockWebsite?
// findBlockWebsite: check if url is in the blockWebsites list
// isMatchedBlockWebsite: check if url is in the active of blockWebsites list
// findBlockWebsite: dont care about those non active websites because we are going to active it again
// isMatchedBlockWebsite: care about if those saved website is active or not, so their result wont count those inactive website
export const findBlockWebsite = (url: string | undefined, blockWebsites: Website[]): Website | undefined => {
  const run = (url: string | undefined, blockWebsites: Website[]): Website | undefined => {
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

  console.group('findBlockWebsite start')
  console.log('findBlockWebsite params:', { url, blockWebsites })
  const result = run(url, blockWebsites)
  console.log('findBlockWebsite result', result)
  console.groupEnd()
  return result
}

// determine if current website satisfies the blacklist
const isMatchedBlockWebsite = (url: string | undefined, blockWebsites: Website[]): boolean => {
  const run = (url: string | undefined, blockWebsites: Website[]) => {
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
    const result = !!blockWebsites.find(
      blockWebsite => isEnabledBlock(blockWebsite) && u.hostname.toLowerCase().includes(blockWebsite.url.toLowerCase()),
    )
    return result
  }

  console.group('isMatchedBlockWebsite start')
  console.log('isMatchedBlockWebsite params:', { url, blockWebsites })
  const result = run(url, blockWebsites)
  console.log('isMatchedBlockWebsite result', result)
  console.groupEnd()
  return result
}

// determine if current website should be block
export const isBlockWebsite = async (url?: string, blockWebsitesParam?: Website[]): Promise<boolean> => {
  const run = async (url?: string, blockWebsitesParam?: Website[]): Promise<boolean> => {
    const blockWebsites = blockWebsitesParam || (await storage.get('blockWebsites')).blockWebsites
    if (url && typeof url == 'string') {
      return isMatchedBlockWebsite(url, blockWebsites)
    } else {
      const currentActivedTab = await getActivatedTab()
      if (!currentActivedTab) return false
      if (blockWebsites) return isMatchedBlockWebsite(currentActivedTab.url, blockWebsites)
      else return false
    }
  }

  console.group('isBlockWebsite start')
  console.log('isBlockWebsite params:', { url, blockWebsitesParam })
  const result = await run(url, blockWebsitesParam)
  console.log('isBlockWebsite result', result)
  console.groupEnd()
  return result
}

const isRemove = async (url: string): Promise<boolean> => {
  const run = async (url: string): Promise<boolean> => {
    const storageData = await storage.get()
    if (await isBlockTime(storageData)) {
      const isBlock = await isBlockWebsite(url, storageData.blockWebsites)
      return isBlock
    }
    return false
  }

  console.group('isRemove start')
  console.log('isRemove params:', { url })
  const result = await run(url)
  console.log('isRemove result', result)
  console.groupEnd()
  return result
}

export const checkAndTryRemove = async (tab?: chrome.tabs.Tab): Promise<void> => {
  const run = async (tab?: chrome.tabs.Tab): Promise<void> => {
    try {
      if (!(await isBlockTime())) return
      const { url, id } = tab || (await getActivatedTab()) || {}
      if (!id || !url) return
      const result = await isRemove(url)
      if (result) {
        await tryLoop(() => chrome.tabs.remove(id), 100, 10, undefined, 'Remove Tab')
      }
    } catch {}
  }

  console.group('checkAndTryRemove start')
  console.log('checkAndTryRemove params:', { tab })
  const result = await run(tab)
  console.log('checkAndTryRemove result', result)
  console.groupEnd()
  return result
}

export const isEnabledBlock = (website: Website): boolean => {
  return website.active && (website.temporaryDisableTimestamp || 0) + TEMPORARY_DISABLE_TIME < Date.now()
}
