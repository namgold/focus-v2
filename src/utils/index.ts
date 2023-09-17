import Notify from 'simple-notify'
import Swal, { SweetAlertIcon } from 'sweetalert2'

export const secondToMinutes = (second: number) => {
  return format2(Math.floor(second / 60)) + ':' + format2(Math.floor(second % 60))
}
export const formatLink = (url: string) =>
  new URL(url.startsWith('https://') || url.startsWith('http://') ? url : 'https://' + url)
export const randomPassword = (length = 10) =>
  Array(Math.ceil(length / 10))
    .fill(0)
    .map(() => Math.random().toString(36).substring(2, 15))
    .join('')
    .slice(-length)
export const addKeyBlockWebsites = (website: Website) => !website.key && (website.key = randomPassword(50))
export const format2 = (number: number) => (number < 10 ? '0' + number : number)

export enum NOTIFY_TYPE {
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
}
export const notify = (message: string, type: NOTIFY_TYPE) => {
  new Notify({
    type: 2,
    status: type,
    // title: 'Notify Title',
    text: message,
    effect: 'fade',
    speed: 300,
    customClass: '',
    customIcon: '',
    showIcon: true,
    showCloseButton: true,
    autoclose: false,
    autotimeout: 3000,
    gap: 20,
    distance: 20,
    position: 'right top',
  })
}

export enum ALERT_TYPE {
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info',
  QUESTION = 'question',
}

export const alert = (text: string, type: ALERT_TYPE, isShowButton?: boolean, timer?: number) => {
  let options: { text: string; timer?: number; showConfirmButton: boolean; icon?: SweetAlertIcon } = {
    text,
    showConfirmButton: isShowButton ?? true,
  }
  if (type) options.icon = type
  if (timer) options.timer = timer
  Swal.fire(options)
}

export const confirm = async (
  title: string,
  html: string,
  type: ALERT_TYPE = ALERT_TYPE.WARNING,
  focusCancel: boolean = false,
  showDenyButton: boolean = false,
): Promise<{ isConfirmed: boolean; isDenied: boolean }> => {
  return Swal.fire({
    icon: type,
    title,
    html,
    focusCancel,
    showConfirmButton: true,
    showDenyButton,
    showCancelButton: true,
  })
}

export const setIntervalRoundSecond = (callback: Function) => {
  const intervalId: { id: NodeJS.Timer } = { id: setInterval(() => 0) }
  const handler = () => {
    const next = 1000 - (Date.now() % 1000)
    setTimeout(() => {
      callback()
      intervalId.id = setInterval(() => {
        const now = Date.now()
        callback()
        if (now % 1000 > 5) {
          clearInterval(intervalId.id)
          handler()
        }
      }, 1000)
    }, next)
  }
  handler()
  return intervalId
}

export const getUniques = function <T>(arr: T[], selector = (x: T) => x) {
  let map = new Map() // todo: use set
  let result: T[] = []
  arr.forEach(i => {
    if (!map.get(selector(i))) {
      map.set(selector(i), true)
      result.push(i)
    }
  })
  return result
}

export const hasDuplicate = function <T>(arr: T[], selector: (x: T) => any = (x: T) => x) {
  let map = new Map<ReturnType<typeof selector>, boolean | undefined>()
  for (let i of arr) {
    if (!map.get(selector(i))) {
      map.set(selector(i), true)
    } else {
      return true
    }
  }
  return false
}

function sleep(duration: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, duration)
  })
}

export const tryLoop = async <T>(
  callback: () => Promise<T>,
  delay: number = 400,
  maxTries: number = 100,
  validateResult?: (value: T) => boolean,
  debugTitle?: string,
): Promise<T | undefined> => {
  let runCount = 0
  const run = async (): Promise<T | undefined> => {
    runCount++
    if (runCount >= maxTries) return undefined
    try {
      const result = await callback()
      if (validateResult) {
        if (validateResult(result)) return result
        throw ''
      }
      return result
    } catch {
      await sleep(delay)
      return run()
    }
  }
  const result = await run()
  if (debugTitle) {
    if (validateResult && result ? validateResult(result) : true) {
      console.info(`Running ${debugTitle} success at ${runCount} times after ${(runCount * delay) / 1000}s.`)
      console.info('Result =', result)
    } else {
      console.warn(`Running ${debugTitle} ${runCount} times failed`)
    }
  }
  return result
}
