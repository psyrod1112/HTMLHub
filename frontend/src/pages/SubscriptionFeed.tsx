import { useEffect, useState } from 'react'
import * as api from '../api'
import type { Project } from '../api/types'
import { ProjectGrid } from '../components/ProjectCard'
import { SkeletonGrid } from './Home'

export default function SubscriptionFeed() {
  const [items, setItems] = useState<Project[] | null>(null)

  useEffect(() => {
    api.getSubscriptionFeed().then((r) => setItems(r.items))
  }, [])

  return (
    <div className="page">
      <h1 className="page-title">구독</h1>
      {items === null ? (
        <SkeletonGrid />
      ) : items.length === 0 ? (
        <p className="page-msg">구독한 크리에이터의 HTML이 여기 모여요.</p>
      ) : (
        <ProjectGrid projects={items} />
      )}
    </div>
  )
}
