import React from 'react'
import ReactDOM from 'react-dom'

import Timer from './Timer'
import { printLine } from './modules/print'

console.log('Content script works!')
console.log('Must reload extension for modifications to take effect.')

printLine("Using the 'printLine' function from the Print Module")

const TIMER_ROOT_ID = 'timer-root'

const InjectTimer = async () => {
  const isBlock = await isBlockWebsite(window.location.origin)
  if (!isBlock) return null

  if (!document.getElementById(TIMER_ROOT_ID)) {
    const timerRoot = document.createElement('div')
    timerRoot.setAttribute('id', TIMER_ROOT_ID)
    document.body.appendChild(timerRoot)
    ReactDOM.render(
      <React.StrictMode>
        <Timer />
      </React.StrictMode>,
      timerRoot,
    )
  }
}

InjectTimer()
