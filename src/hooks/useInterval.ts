import { useEffect, useRef } from 'react'
import { setIntervalRoundSecond } from '../utils'

function useInterval(callback: Function, delay: number) {
  const savedCallback = useRef<Function>(callback)
  savedCallback.current = callback

  // Set up the interval.
  useEffect(() => {
    if (delay !== null) {
      let intervalId = setIntervalRoundSecond(savedCallback.current)
      return () => clearInterval(intervalId.id)
    }
  }, [delay])
}

export default useInterval
