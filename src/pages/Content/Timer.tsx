import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import { useChromeStorageSync } from 'use-chrome-storage'

import { DEFAULT } from '../../constants/index'
import useInterval from '../../hooks/useInterval'
import { secondToMinutes } from '../../utils'
import { isBlockWebsite } from '../../utils/helper'

// const TimerWrapper = styled.div<{ timeLeft: number }>`
//   position: fixed;
//   bottom: 15px;
//   left: 15px;
//   text-shadow: rgba(150, 150, 150, 0.9) 2px 2px 8px;
//   color: ${({ timeLeft: number }) => (timeleft < 10 ? css`rgb(255, 78, 78)` : css`rgb(0, 255, 78`)};
//   padding: 5px 8px;
//   background-color: rgb(0, 0, 0);
//   border-radius: 10px;
//   opacity: 0.7;
//   font-size: 18px;
// `

const Timer = () => {
  const [pausedActivated] = useChromeStorageSync('pausedActivated', DEFAULT.pausedActivated)
  const { timestamp, pauseAmount } = pausedActivated
  const [, forceUpdate] = useState(0)
  useInterval(() => requestAnimationFrame(forceUpdate), 1000)
  const timeleft = (timestamp + pauseAmount * 60000 - Date.now()) / 1000

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '15px',
        left: '15px',
        textShadow: 'rgba(150, 150, 150, 0.9) 2px 2px 8px',
        color: timeleft < 10 ? 'rgb(255, 78, 78)' : 'rgb(0, 255, 78)',
        padding: '5px 8px',
        backgroundColor: 'rgb(0, 0, 0)',
        borderRadius: '10px',
        opacity: '0.7',
        fontSize: '18px',
      }}
    >
      <span>{timeleft < 1 ? 'Bye!' : secondToMinutes(timeleft)}</span>
    </div>
  )
}

export default Timer
