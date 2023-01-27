export const DEFAULT = {
  blockWebsites: [
    { url: 'facebook.com', active: true, temporaryDisableTimestamp: 0 },
    { url: 'youtube.com', active: false, temporaryDisableTimestamp: 0 },
    { url: 'twitter.com', active: false, temporaryDisableTimestamp: 0 },
    { url: 'reddit.com', active: false, temporaryDisableTimestamp: 0 },
    { url: 'pinterest.com', active: true, temporaryDisableTimestamp: 0 },
    { url: 'vimeo.com', active: true, temporaryDisableTimestamp: 0 },
    { url: 'tumblr.com', active: true, temporaryDisableTimestamp: 0 },
    { url: 'instagram.com', active: true, temporaryDisableTimestamp: 0 },
    { url: 'tiktok.com', active: true, temporaryDisableTimestamp: 0 },
    { url: 'quora.com', active: false, temporaryDisableTimestamp: 0 },
    { url: 'yahoo.com', active: false, temporaryDisableTimestamp: 0 },
    { url: 'netflix.com', active: true, temporaryDisableTimestamp: 0 },
    { url: 'voz.vn', active: true, temporaryDisableTimestamp: 0 },
    { url: 'o.voz.vn', active: true, temporaryDisableTimestamp: 0 },
  ] as Website[],
  // timeTracker: [],
  // elapsed: 0,
  pausedActivated: {
    timestamp: 0 as number,
    pauseAmount: 5 as number,
    resetAmount: 30 as number,
    lastTempPaused: 0 as number,
  },
  pauseAmount: 7 as number,
  resetAmount: 55 as number,
  activated: true as boolean,
}

export const TEMPORARY_DISABLE_TIME = 300_000 // 5 mins

export const TEMPORARY_PAUSE_MIN_WAIT = 600_000 // 10 mins

export const storage = chrome.storage.sync
