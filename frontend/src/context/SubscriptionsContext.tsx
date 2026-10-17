import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import * as api from '../api'
import type { SubscribedChannel } from '../api/types'
import { useAuth } from './AuthContext'

interface SubsState {
  channels: SubscribedChannel[]
  refresh: () => Promise<void>
}

const SubsContext = createContext<SubsState | null>(null)

export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const { me } = useAuth()
  const [channels, setChannels] = useState<SubscribedChannel[]>([])

  const refresh = useCallback(async () => {
    setChannels(await api.getMySubscriptions())
  }, [])

  useEffect(() => {
    refresh()
  }, [me, refresh])

  return <SubsContext.Provider value={{ channels, refresh }}>{children}</SubsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSubscriptions() {
  const ctx = useContext(SubsContext)
  if (!ctx) throw new Error('useSubscriptions must be used inside SubscriptionsProvider')
  return ctx
}
