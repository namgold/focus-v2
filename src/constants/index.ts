export const DEFAULT = {
  blockWebsites: [
    { url: 'facebook.com', active: true },
    { url: 'youtube.com', active: false },
    { url: 'twitter.com', active: false },
    { url: 'reddit.com', active: false },
    { url: 'pinterest.com', active: true },
    { url: 'vimeo.com', active: true },
    { url: 'tumblr.com', active: true },
    { url: 'instagram.com', active: true },
    { url: 'tiktok.com', active: true },
    { url: 'quora.com', active: false },
    { url: 'yahoo.com', active: false },
    { url: 'netflix.com', active: true },
    { url: 'voz.vn', active: true },
    { url: 'o.voz.vn', active: true },
  ] as Website[],
  // timeTracker: [],
  // elapsed: 0,
  pausedActivated: {
    timestamp: 0 as number,
    pauseAmount: 5 as number,
    resetAmount: 30 as number,
  },
  pauseAmount: 7 as number,
  resetAmount: 55 as number,
  activated: true as boolean,
}

export const storage = chrome.storage.sync
