import { createIdleInvitationScheduler } from './idle-invitation-scheduler'

export type UAgentCommunicationState =
  | { kind: 'idle_invitation' }
  | { kind: 'awaiting_user'; conversationId: string }

export type UAgentEntryAdapter = {
  wasRecentlyActive: (withinMs: number) => boolean
  playCreateGameOnce: () => Promise<void>
  playYourTurnOnce: (conversationId: string) => Promise<void>
  showPureU: () => void
  showYourTurnSettled: (conversationId: string) => void
  openCreateGameAgent: () => void
  openConversation: (conversationId: string) => void
}

export function createUAgentEntryController(adapter: UAgentEntryAdapter) {
  let currentState: UAgentCommunicationState | undefined
  let awaitingGeneration = 0
  let useCooldownOnNextIdle = false

  const idleScheduler = createIdleInvitationScheduler({
    isIdleInvitationState: () => currentState?.kind === 'idle_invitation',
    wasRecentlyActive: adapter.wasRecentlyActive,
    playCreateGameOnce: adapter.playCreateGameOnce,
  })

  const isSameState = (
    previous: UAgentCommunicationState | undefined,
    next: UAgentCommunicationState,
  ) => previous?.kind === next.kind
    && (next.kind !== 'awaiting_user'
      || (previous.kind === 'awaiting_user'
        && previous.conversationId === next.conversationId))

  return {
    async setState(next: UAgentCommunicationState) {
      const previous = currentState
      if (isSameState(previous, next)) return
      currentState = next

      if (next.kind === 'awaiting_user') {
        idleScheduler.stop()
        useCooldownOnNextIdle = true
        const playbackGeneration = ++awaitingGeneration

        await adapter.playYourTurnOnce(next.conversationId)
        if (
          playbackGeneration === awaitingGeneration
          && currentState.kind === 'awaiting_user'
          && currentState.conversationId === next.conversationId
        ) {
          adapter.showYourTurnSettled(next.conversationId)
        }
        return
      }

      awaitingGeneration += 1
      adapter.showPureU()
      idleScheduler.start({ afterWaiting: useCooldownOnNextIdle })
      useCooldownOnNextIdle = false
    },

    handlePress() {
      if (currentState?.kind === 'awaiting_user') {
        adapter.openConversation(currentState.conversationId)
      } else {
        adapter.openCreateGameAgent()
      }
    },

    destroy() {
      awaitingGeneration += 1
      idleScheduler.destroy()
    },
  }
}

