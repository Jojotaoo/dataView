import { toMilliseconds } from './useRequestMerge'

interface PollingTimer {
  timer: ReturnType<typeof setInterval>
  interval: number
  unit: string
}

const timers = new Map<string, PollingTimer>()

export function startPolling(
  key: string,
  callback: () => Promise<void> | void,
  interval: number,
  unit: string
): void {
  stopPolling(key)

  const ms = toMilliseconds(interval, unit)
  const timer = setInterval(async () => {
    try {
      await callback()
    } catch (error) {
      console.error(`[Polling] Error in callback for key "${key}":`, error)
    }
  }, ms)

  timers.set(key, { timer, interval, unit })
}

export function stopPolling(key: string): void {
  const polling = timers.get(key)
  if (polling) {
    clearInterval(polling.timer)
    timers.delete(key)
  }
}

export function stopAllPolling(): void {
  timers.forEach((polling) => {
    clearInterval(polling.timer)
  })
  timers.clear()
}

export function resetPolling(
  key: string,
  callback: () => Promise<void> | void,
  interval: number,
  unit: string
): void {
  stopPolling(key)
  startPolling(key, callback, interval, unit)
}

export function hasPolling(key: string): boolean {
  return timers.has(key)
}

export function getPollingInfo(key: string): { interval: number; unit: string } | null {
  const polling = timers.get(key)
  if (polling) {
    return { interval: polling.interval, unit: polling.unit }
  }
  return null
}
