export type IdleInvitationSchedulerOptions = {
  isIdleInvitationState: () => boolean
  wasRecentlyActive: (withinMs: number) => boolean
  playCreateGameOnce: () => Promise<void>
}

const FIRST_DELAY_SECONDS = { min: 5, max: 10 }
const NEXT_DELAY_SECONDS = { min: 10, max: 30 }
const RECENT_INTERACTION_GUARD_MS = 8_000
const AFTER_WAITING_COOLDOWN_MS = 60_000

export const randomSeconds = (min: number, max: number) =>
  min + Math.random() * (max - min)

const randomMilliseconds = ({ min, max }: { min: number; max: number }) =>
  randomSeconds(min, max) * 1_000

export function createIdleInvitationScheduler({
  isIdleInvitationState,
  wasRecentlyActive,
  playCreateGameOnce,
}: IdleInvitationSchedulerOptions) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let deadline = 0
  let remainingMs: number | undefined
  let generation = 0
  let active = false
  let isFirstPlayback = true

  const clearTimer = () => {
    if (timer) clearTimeout(timer)
    timer = undefined
  }

  const arm = (delayMs: number) => {
    clearTimer()
    remainingMs = undefined
    deadline = Date.now() + delayMs
    const scheduledGeneration = generation

    timer = setTimeout(async () => {
      timer = undefined
      if (!active || scheduledGeneration !== generation || !isIdleInvitationState()) return

      if (document.hidden) {
        remainingMs = 0
        return
      }

      if (wasRecentlyActive(RECENT_INTERACTION_GUARD_MS)) {
        arm(RECENT_INTERACTION_GUARD_MS)
        return
      }

      await playCreateGameOnce()
      if (!active || scheduledGeneration !== generation || !isIdleInvitationState()) return

      isFirstPlayback = false
      arm(randomMilliseconds(NEXT_DELAY_SECONDS))
    }, delayMs)
  }

  const pause = () => {
    if (!active || !timer) return
    remainingMs = Math.max(0, deadline - Date.now())
    clearTimer()
  }

  const resume = () => {
    if (!active || timer) return
    const fallbackRange = isFirstPlayback ? FIRST_DELAY_SECONDS : NEXT_DELAY_SECONDS
    arm(remainingMs ?? randomMilliseconds(fallbackRange))
  }

  const onVisibilityChange = () => {
    if (document.hidden) pause()
    else resume()
  }

  document.addEventListener('visibilitychange', onVisibilityChange)

  const stop = () => {
    generation += 1
    active = false
    remainingMs = undefined
    clearTimer()
  }

  return {
    start({ afterWaiting = false } = {}) {
      generation += 1
      active = true
      isFirstPlayback = true
      const cooldown = afterWaiting ? AFTER_WAITING_COOLDOWN_MS : 0
      arm(cooldown + randomMilliseconds(FIRST_DELAY_SECONDS))
    },

    stop,

    destroy() {
      stop()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    },
  }
}
