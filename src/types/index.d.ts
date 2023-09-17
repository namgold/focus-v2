type Website = {
  url: string
  active: boolean
  key?: string
  temporaryDisableTimestamp?: number
}

type Storage = {
  blockWebsites: Website[]
  pausedActivated: {
    timestamp: number
    pauseAmount: number
    resetAmount: number
    lastTempPaused: number
  }
  pauseAmount: number
  resetAmount: number
  activated: boolean
}
