import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as api from '../api'
import { useAuth } from '../context/AuthContext'
import { useSubscriptions } from '../context/SubscriptionsContext'
import { IconCheck } from './Icons'

export default function SubscribeButton({ userId, subscribed, onChange }: { userId: number; subscribed: boolean; onChange: (v: boolean) => void }) {
  const { me } = useAuth()
  const { refresh } = useSubscriptions()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)

  if (me?.id === userId) return null

  const click = async () => {
    if (!me) return navigate('/login')
    setBusy(true)
    onChange(!subscribed) // 즉시 반영 (낙관적 업데이트)
    try {
      await (subscribed ? api.unsubscribe(userId) : api.subscribe(userId))
      await refresh()
    } catch {
      onChange(subscribed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button className={`btn ${subscribed ? 'btn-muted' : 'btn-dark'}`} onClick={click} disabled={busy}>
      {subscribed && <IconCheck width={16} />}
      {subscribed ? '구독중' : '구독'}
    </button>
  )
}
