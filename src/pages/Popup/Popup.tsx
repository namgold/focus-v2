import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useChromeStorageSync } from 'use-chrome-storage'

import { DEFAULT } from '../../constants'
import useInterval from '../../hooks/useInterval'
import { checkAndTryRemove, findBlockWebsite, getActivatedTab, isBlockWebsite } from '../../utils/helper'
import { NOTIFY_TYPE, addKeyBlockWebsites, notify, secondToMinutes } from '../../utils/index'
import './popup.css'

const Popup = () => {
  let [blockWebsites, setBlockWebsites] = useChromeStorageSync('blockWebsites', DEFAULT.blockWebsites)
  const [pausedActivated, setPausedActivated] = useChromeStorageSync('pausedActivated', DEFAULT.pausedActivated)
  const [pauseAmount] = useChromeStorageSync('pauseAmount', DEFAULT.pauseAmount)
  const [resetAmount] = useChromeStorageSync('resetAmount', DEFAULT.resetAmount)
  const [, forceUpdate] = useState<any>()
  const pauseLeft = (pausedActivated.timestamp + pausedActivated.pauseAmount * 60000 - Date.now()) / 1000
  const unlockIn = (pausedActivated.timestamp + pausedActivated.resetAmount * 60000 - Date.now()) / 1000
  const currentTab = useRef<chrome.tabs.Tab | undefined>(undefined)
  // const isBlocked = currentTab.current?.url && isBlockWebsite(currentTab.current?.url, blockWebsites)
  const [isBlocked, setIsBlocked] = useState<boolean>(false)

  useEffect(() => {
    const run = async () => {
      const result = Boolean(currentTab.current?.url) && (await isBlockWebsite(currentTab.current?.url, blockWebsites))
      setIsBlocked(result)
    }
    run()
  }, [blockWebsites])

  useEffect(() => {
    const run = async () => {
      const tab = await getActivatedTab()
      currentTab.current = tab
    }
    run()
  }, [])

  blockWebsites = blockWebsites || []

  const onPause = () =>
    setPausedActivated({
      timestamp: new Date().getTime(),
      pauseAmount,
      resetAmount,
    })

  const onBlockThisSite = useCallback(() => {
    if (!currentTab.current || !currentTab.current.url) return
    if (!isBlockWebsite(currentTab.current.url, blockWebsites)) {
      try {
        let blockWebsiteRecord = findBlockWebsite(currentTab.current.url, blockWebsites)
        if (blockWebsiteRecord) {
          blockWebsiteRecord.active = true
        } else {
          blockWebsiteRecord = { url: new URL(currentTab.current.url).hostname, active: true }
          addKeyBlockWebsites(blockWebsiteRecord)
          blockWebsites.push(blockWebsiteRecord)
        }
        setBlockWebsites(blockWebsites)
        checkAndTryRemove(currentTab.current)
      } catch (e) {}
    }
    notify('Website has been blocked', NOTIFY_TYPE.SUCCESS)
  }, [blockWebsites, setBlockWebsites])

  useInterval(() => requestAnimationFrame(() => forceUpdate({})), 1000)

  return (
    <div className="popup">
      <div className="row" style={{ justifyContent: 'center' }}>
        <h1>FOCUS</h1>
      </div>
      <div className="row mt-3">
        <div className="col">
          <button className="btn btn-success" onClick={onPause} disabled={unlockIn > 0}>
            {pauseLeft > 0 ? (
              <>
                Pause time left: <span className="text-monospace">{secondToMinutes(pauseLeft)}</span>
              </>
            ) : unlockIn > 0 ? (
              <>
                Unlock in: <span className="text-monospace">{secondToMinutes(unlockIn)}</span>
              </>
            ) : (
              <>Pause for {pauseAmount} minutes</>
            )}
          </button>
        </div>
      </div>
      {currentTab.current?.url && /https?/.test(new URL(currentTab.current?.url).protocol) && (
        <div className="row mt-3">
          <div className="col">
            <button className="btn btn-danger" onClick={onBlockThisSite} disabled={isBlocked}>
              {isBlocked ? 'This site has been blocked' : 'Block this site!'}
            </button>
          </div>
        </div>
      )}
      {/* <div className='row'>
                <div className='col'>
                    <button class='btn btn-success' onClick={onCancel}>Cancel</button>
                </div>
            </div> */}
    </div>
  )
}

export default Popup
